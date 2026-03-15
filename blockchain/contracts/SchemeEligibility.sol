// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CitizenRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SchemeEligibility
 * @dev Smart contract for checking and storing scheme eligibility
 * Demonstrates automated eligibility verification for SIH
 */
contract SchemeEligibility is Ownable, ReentrancyGuard {
    
    CitizenRegistry public citizenRegistry;
    
    enum SchemeType {
        PM_KISAN,
        PM_SCHOLARSHIP,
        OLD_AGE_PENSION,
        PM_UJJWALA,
        EMPLOYMENT_SCHEME,
        HEALTHCARE_SCHEME
    }
    
    enum EligibilityStatus {
        PENDING,
        ELIGIBLE,
        NOT_ELIGIBLE,
        DOCUMENTS_REQUIRED
    }
    
    struct SchemeApplication {
        address applicant;
        SchemeType schemeType;
        EligibilityStatus status;
        string reason;
        uint256 applicationTime;
        uint256 decisionTime;
        address verifiedBy;
        bool benefitDisbursed;
        uint256 benefitAmount;
    }
    
    struct SchemeConfig {
        string name;
        uint256 maxAge;
        uint256 minAge;
        uint256 maxIncome;
        bool genderSpecific;
        string requiredGender;
        bool categorySpecific;
        string requiredCategory;
        bool isActive;
        uint256 benefitAmount;
    }
    
    // Storage
    mapping(SchemeType => SchemeConfig) public schemeConfigs;
    mapping(address => mapping(SchemeType => SchemeApplication)) public applications;
    mapping(address => SchemeType[]) public userApplications;
    
    // Events
    event ApplicationSubmitted(address indexed applicant, SchemeType schemeType, uint256 timestamp);
    event EligibilityDecision(address indexed applicant, SchemeType schemeType, EligibilityStatus status, string reason);
    event BenefitDisbursed(address indexed beneficiary, SchemeType schemeType, uint256 amount, uint256 timestamp);
    
    constructor(address _citizenRegistryAddress) {
        citizenRegistry = CitizenRegistry(_citizenRegistryAddress);
        initializeSchemes();
    }
    
    /**
     * @dev Initialize scheme configurations
     */
    function initializeSchemes() internal {
        // PM Kisan - for farmers
        schemeConfigs[SchemeType.PM_KISAN] = SchemeConfig({
            name: "PM Kisan Yojana",
            maxAge: 100,
            minAge: 18,
            maxIncome: 200000, // 2 lakh per year
            genderSpecific: false,
            requiredGender: "",
            categorySpecific: false,
            requiredCategory: "",
            isActive: true,
            benefitAmount: 6000
        });
        
        // PM Scholarship - for students
        schemeConfigs[SchemeType.PM_SCHOLARSHIP] = SchemeConfig({
            name: "PM Scholarship",
            maxAge: 30,
            minAge: 18,
            maxIncome: 600000, // 6 lakh per year
            genderSpecific: false,
            requiredGender: "",
            categorySpecific: false,
            requiredCategory: "",
            isActive: true,
            benefitAmount: 12000
        });
        
        // Old Age Pension
        schemeConfigs[SchemeType.OLD_AGE_PENSION] = SchemeConfig({
            name: "Old Age Pension",
            maxAge: 100,
            minAge: 60,
            maxIncome: 100000, // 1 lakh per year
            genderSpecific: false,
            requiredGender: "",
            categorySpecific: false,
            requiredCategory: "",
            isActive: true,
            benefitAmount: 12000
        });
        
        // PM Ujjwala - for women
        schemeConfigs[SchemeType.PM_UJJWALA] = SchemeConfig({
            name: "PM Ujjwala Yojana",
            maxAge: 100,
            minAge: 18,
            maxIncome: 100000, // 1 lakh per year
            genderSpecific: true,
            requiredGender: "Female",
            categorySpecific: false,
            requiredCategory: "",
            isActive: true,
            benefitAmount: 1600
        });
    }
    
    /**
     * @dev Apply for a government scheme
     */
    function applyForScheme(SchemeType _schemeType) external nonReentrant {
        require(citizenRegistry.isRegistered(msg.sender), "Citizen not registered");
        require(schemeConfigs[_schemeType].isActive, "Scheme not active");
        require(applications[msg.sender][_schemeType].applicationTime == 0, "Already applied for this scheme");
        
        // Create application
        applications[msg.sender][_schemeType] = SchemeApplication({
            applicant: msg.sender,
            schemeType: _schemeType,
            status: EligibilityStatus.PENDING,
            reason: "Application submitted, under review",
            applicationTime: block.timestamp,
            decisionTime: 0,
            verifiedBy: address(0),
            benefitDisbursed: false,
            benefitAmount: 0
        });
        
        userApplications[msg.sender].push(_schemeType);
        
        emit ApplicationSubmitted(msg.sender, _schemeType, block.timestamp);
        
        // Auto-check eligibility
        _checkEligibility(msg.sender, _schemeType);
    }
    
    /**
     * @dev Internal function to check eligibility automatically
     */
    function _checkEligibility(address _applicant, SchemeType _schemeType) internal {
        // Get citizen data
        (
            string memory name,
            uint256 age,
            string memory gender,
            string memory category,
            uint256 annualIncome,
            bool isVerified,
            uint256 registrationTime
        ) = citizenRegistry.getCitizen(_applicant);
        
        require(isVerified, "Citizen not verified by government");
        
        SchemeConfig memory scheme = schemeConfigs[_schemeType];
        string memory rejectReason = "";
        bool eligible = true;
        
        // Check age criteria
        if (age < scheme.minAge || age > scheme.maxAge) {
            rejectReason = string(abi.encodePacked("Age not in range ", 
                _uint2str(scheme.minAge), "-", _uint2str(scheme.maxAge)));
            eligible = false;
        }
        
        // Check income criteria
        if (annualIncome > scheme.maxIncome) {
            rejectReason = string(abi.encodePacked("Income exceeds limit of ", 
                _uint2str(scheme.maxIncome)));
            eligible = false;
        }
        
        // Check gender criteria
        if (scheme.genderSpecific && !_compareStrings(gender, scheme.requiredGender)) {
            rejectReason = string(abi.encodePacked("Scheme is for ", scheme.requiredGender, " only"));
            eligible = false;
        }
        
        // Check category criteria
        if (scheme.categorySpecific && !_compareStrings(category, scheme.requiredCategory)) {
            rejectReason = string(abi.encodePacked("Scheme is for ", scheme.requiredCategory, " category only"));
            eligible = false;
        }
        
        // Update application status
        EligibilityStatus status = eligible ? EligibilityStatus.ELIGIBLE : EligibilityStatus.NOT_ELIGIBLE;
        string memory finalReason = eligible ? "Meets all eligibility criteria" : rejectReason;
        
        applications[_applicant][_schemeType].status = status;
        applications[_applicant][_schemeType].reason = finalReason;
        applications[_applicant][_schemeType].decisionTime = block.timestamp;
        
        emit EligibilityDecision(_applicant, _schemeType, status, finalReason);
    }
    
    /**
     * @dev Manual verification by government official
     */
    function verifyApplication(address _applicant, SchemeType _schemeType, EligibilityStatus _status, string memory _reason) external onlyOwner {
        require(applications[_applicant][_schemeType].applicationTime != 0, "No application found");
        
        applications[_applicant][_schemeType].status = _status;
        applications[_applicant][_schemeType].reason = _reason;
        applications[_applicant][_schemeType].decisionTime = block.timestamp;
        applications[_applicant][_schemeType].verifiedBy = msg.sender;
        
        emit EligibilityDecision(_applicant, _schemeType, _status, _reason);
    }
    
    /**
     * @dev Disburse benefit (mock function for demo)
     */
    function disburseBenefit(address _beneficiary, SchemeType _schemeType) external onlyOwner {
        require(applications[_beneficiary][_schemeType].status == EligibilityStatus.ELIGIBLE, "Not eligible");
        require(!applications[_beneficiary][_schemeType].benefitDisbursed, "Benefit already disbursed");
        
        uint256 amount = schemeConfigs[_schemeType].benefitAmount;
        
        applications[_beneficiary][_schemeType].benefitDisbursed = true;
        applications[_beneficiary][_schemeType].benefitAmount = amount;
        
        emit BenefitDisbursed(_beneficiary, _schemeType, amount, block.timestamp);
    }
    
    /**
     * @dev Get application status
     */
    function getApplicationStatus(address _applicant, SchemeType _schemeType) external view returns (
        EligibilityStatus status,
        string memory reason,
        uint256 applicationTime,
        uint256 decisionTime,
        bool benefitDisbursed,
        uint256 benefitAmount
    ) {
        SchemeApplication memory app = applications[_applicant][_schemeType];
        return (
            app.status,
            app.reason,
            app.applicationTime,
            app.decisionTime,
            app.benefitDisbursed,
            app.benefitAmount
        );
    }
    
    /**
     * @dev Get all user applications
     */
    function getUserApplications(address _user) external view returns (SchemeType[] memory) {
        return userApplications[_user];
    }
    
    /**
     * @dev Helper function to compare strings
     */
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
    /**
     * @dev Helper function to convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        
        str = string(bstr);
    }
}