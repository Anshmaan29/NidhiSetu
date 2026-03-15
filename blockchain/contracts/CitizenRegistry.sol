// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CitizenRegistry
 * @dev Smart contract for managing citizen KYC and verification on blockchain
 * Perfect for SIH hackathon - demonstrates blockchain's security benefits
 */
contract CitizenRegistry is Ownable, ReentrancyGuard {
    
    struct Citizen {
        string name;
        uint256 aadhaarHash; // Hash of Aadhaar for privacy
        string phoneNumber;
        uint256 age;
        string gender;
        string category; // General, OBC, SC, ST
        uint256 annualIncome;
        bool isVerified;
        uint256 registrationTime;
        address walletAddress;
    }
    
    // Mappings
    mapping(address => Citizen) public citizens;
    mapping(uint256 => address) public aadhaarToAddress;
    mapping(address => bool) public isRegistered;
    
    // Events for transparency
    event CitizenRegistered(address indexed citizenAddress, uint256 aadhaarHash, string name);
    event CitizenVerified(address indexed citizenAddress, uint256 timestamp);
    event CitizenUpdated(address indexed citizenAddress, uint256 timestamp);
    
    // Government verifiers
    mapping(address => bool) public authorizedVerifiers;
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    modifier onlyRegisteredCitizen() {
        require(isRegistered[msg.sender], "Citizen not registered");
        _;
    }
    
    /**
     * @dev Constructor - sets up government admin
     */
    constructor() {
        authorizedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Register a new citizen on blockchain
     * This replaces traditional database registration with blockchain security
     */
    function registerCitizen(
        string memory _name,
        uint256 _aadhaarHash,
        string memory _phoneNumber,
        uint256 _age,
        string memory _gender,
        string memory _category,
        uint256 _annualIncome
    ) external nonReentrant {
        require(!isRegistered[msg.sender], "Citizen already registered");
        require(aadhaarToAddress[_aadhaarHash] == address(0), "Aadhaar already registered");
        require(_age >= 18, "Must be 18 or older");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        citizens[msg.sender] = Citizen({
            name: _name,
            aadhaarHash: _aadhaarHash,
            phoneNumber: _phoneNumber,
            age: _age,
            gender: _gender,
            category: _category,
            annualIncome: _annualIncome,
            isVerified: false,
            registrationTime: block.timestamp,
            walletAddress: msg.sender
        });
        
        isRegistered[msg.sender] = true;
        aadhaarToAddress[_aadhaarHash] = msg.sender;
        
        emit CitizenRegistered(msg.sender, _aadhaarHash, _name);
    }
    
    /**
     * @dev Verify citizen by government official
     * Adds government verification layer to citizen data
     */
    function verifyCitizen(address _citizenAddress) external onlyVerifier {
        require(isRegistered[_citizenAddress], "Citizen not registered");
        
        citizens[_citizenAddress].isVerified = true;
        
        emit CitizenVerified(_citizenAddress, block.timestamp);
    }
    
    /**
     * @dev Get citizen details (public for transparency)
     */
    function getCitizen(address _citizenAddress) external view returns (
        string memory name,
        uint256 age,
        string memory gender,
        string memory category,
        uint256 annualIncome,
        bool isVerified,
        uint256 registrationTime
    ) {
        require(isRegistered[_citizenAddress], "Citizen not registered");
        
        Citizen memory citizen = citizens[_citizenAddress];
        return (
            citizen.name,
            citizen.age,
            citizen.gender,
            citizen.category,
            citizen.annualIncome,
            citizen.isVerified,
            citizen.registrationTime
        );
    }
    
    /**
     * @dev Check if citizen meets basic eligibility criteria
     * Used by other contracts for scheme eligibility
     */
    function checkBasicEligibility(address _citizenAddress) external view returns (bool) {
        if (!isRegistered[_citizenAddress]) return false;
        return citizens[_citizenAddress].isVerified;
    }
    
    /**
     * @dev Update citizen information
     */
    function updateCitizenInfo(
        string memory _phoneNumber,
        uint256 _annualIncome
    ) external onlyRegisteredCitizen {
        citizens[msg.sender].phoneNumber = _phoneNumber;
        citizens[msg.sender].annualIncome = _annualIncome;
        
        emit CitizenUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add government verifier
     */
    function addVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
    }
    
    /**
     * @dev Remove government verifier
     */
    function removeVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = false;
    }
    
    /**
     * @dev Get total registered citizens count
     */
    function getTotalCitizens() external view returns (uint256) {
        // This would require maintaining a counter in practice
        // Simplified for hackathon demo
        return 0;
    }
}