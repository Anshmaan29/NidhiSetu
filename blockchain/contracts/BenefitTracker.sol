// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CitizenRegistry.sol";
import "./SchemeEligibility.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BenefitTracker
 * @dev Smart contract for tracking benefit disbursement with full transparency
 * Perfect for SIH demo - shows complete audit trail of government benefits
 */
contract BenefitTracker is Ownable, ReentrancyGuard {
    
    CitizenRegistry public citizenRegistry;
    SchemeEligibility public schemeEligibility;
    
    enum TransactionStatus {
        INITIATED,
        PENDING_APPROVAL,
        APPROVED,
        DISBURSED,
        FAILED,
        CANCELLED
    }
    
    struct BenefitTransaction {
        uint256 transactionId;
        address beneficiary;
        SchemeEligibility.SchemeType schemeType;
        uint256 amount;
        TransactionStatus status;
        string bankAccount;
        string ifscCode;
        uint256 initiatedTime;
        uint256 approvedTime;
        uint256 disbursedTime;
        address approvedBy;
        string remarks;
        string failureReason;
    }
    
    struct SchemeStats {
        uint256 totalApplications;
        uint256 totalApproved;
        uint256 totalDisbursed;
        uint256 totalAmount;
        uint256 averageProcessingTime;
    }
    
    // Storage
    mapping(uint256 => BenefitTransaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(SchemeEligibility.SchemeType => SchemeStats) public schemeStats;
    uint256 public nextTransactionId = 1;
    
    // Events for complete transparency
    event BenefitInitiated(uint256 indexed transactionId, address indexed beneficiary, SchemeEligibility.SchemeType schemeType, uint256 amount);
    event BenefitApproved(uint256 indexed transactionId, address indexed approver, uint256 timestamp);
    event BenefitDisbursed(uint256 indexed transactionId, address indexed beneficiary, uint256 amount, uint256 timestamp);
    event BenefitFailed(uint256 indexed transactionId, string reason);
    event BenefitCancelled(uint256 indexed transactionId, string reason);
    
    constructor(address _citizenRegistryAddress, address _schemeEligibilityAddress) {
        citizenRegistry = CitizenRegistry(_citizenRegistryAddress);
        schemeEligibility = SchemeEligibility(_schemeEligibilityAddress);
    }
    
    /**
     * @dev Initiate benefit disbursement for eligible citizen
     */
    function initiateBenefit(
        address _beneficiary,
        SchemeEligibility.SchemeType _schemeType,
        uint256 _amount,
        string memory _bankAccount,
        string memory _ifscCode
    ) external onlyOwner nonReentrant {
        require(citizenRegistry.isRegistered(_beneficiary), "Beneficiary not registered");
        
        // Check eligibility status
        (
            SchemeEligibility.EligibilityStatus status,
            string memory reason,
            uint256 applicationTime,
            uint256 decisionTime,
            bool benefitDisbursed,
            uint256 benefitAmount
        ) = schemeEligibility.getApplicationStatus(_beneficiary, _schemeType);
        
        require(status == SchemeEligibility.EligibilityStatus.ELIGIBLE, "Beneficiary not eligible");
        require(!benefitDisbursed, "Benefit already disbursed");
        
        uint256 transactionId = nextTransactionId++;
        
        transactions[transactionId] = BenefitTransaction({
            transactionId: transactionId,
            beneficiary: _beneficiary,
            schemeType: _schemeType,
            amount: _amount,
            status: TransactionStatus.INITIATED,
            bankAccount: _bankAccount,
            ifscCode: _ifscCode,
            initiatedTime: block.timestamp,
            approvedTime: 0,
            disbursedTime: 0,
            approvedBy: address(0),
            remarks: "Benefit disbursement initiated",
            failureReason: ""
        });
        
        userTransactions[_beneficiary].push(transactionId);
        
        // Update scheme statistics
        schemeStats[_schemeType].totalApplications++;
        
        emit BenefitInitiated(transactionId, _beneficiary, _schemeType, _amount);
    }
    
    /**
     * @dev Approve benefit for disbursement
     */
    function approveBenefit(uint256 _transactionId, string memory _remarks) external onlyOwner {
        require(transactions[_transactionId].transactionId != 0, "Transaction not found");
        require(transactions[_transactionId].status == TransactionStatus.INITIATED, "Invalid transaction status");
        
        transactions[_transactionId].status = TransactionStatus.APPROVED;
        transactions[_transactionId].approvedTime = block.timestamp;
        transactions[_transactionId].approvedBy = msg.sender;
        transactions[_transactionId].remarks = _remarks;
        
        // Update scheme statistics
        SchemeEligibility.SchemeType schemeType = transactions[_transactionId].schemeType;
        schemeStats[schemeType].totalApproved++;
        
        emit BenefitApproved(_transactionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Mark benefit as disbursed (called by payment system)
     */
    function disburseBenefit(uint256 _transactionId) external onlyOwner {
        require(transactions[_transactionId].transactionId != 0, "Transaction not found");
        require(transactions[_transactionId].status == TransactionStatus.APPROVED, "Transaction not approved");
        
        transactions[_transactionId].status = TransactionStatus.DISBURSED;
        transactions[_transactionId].disbursedTime = block.timestamp;
        
        // Update scheme statistics
        SchemeEligibility.SchemeType schemeType = transactions[_transactionId].schemeType;
        schemeStats[schemeType].totalDisbursed++;
        schemeStats[schemeType].totalAmount += transactions[_transactionId].amount;
        
        // Calculate average processing time
        uint256 processingTime = block.timestamp - transactions[_transactionId].initiatedTime;
        schemeStats[schemeType].averageProcessingTime = 
            (schemeStats[schemeType].averageProcessingTime + processingTime) / 2;
        
        emit BenefitDisbursed(
            _transactionId,
            transactions[_transactionId].beneficiary,
            transactions[_transactionId].amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Mark benefit as failed
     */
    function failBenefit(uint256 _transactionId, string memory _reason) external onlyOwner {
        require(transactions[_transactionId].transactionId != 0, "Transaction not found");
        require(
            transactions[_transactionId].status == TransactionStatus.INITIATED ||
            transactions[_transactionId].status == TransactionStatus.APPROVED,
            "Cannot fail transaction"
        );
        
        transactions[_transactionId].status = TransactionStatus.FAILED;
        transactions[_transactionId].failureReason = _reason;
        
        emit BenefitFailed(_transactionId, _reason);
    }
    
    /**
     * @dev Cancel benefit disbursement
     */
    function cancelBenefit(uint256 _transactionId, string memory _reason) external onlyOwner {
        require(transactions[_transactionId].transactionId != 0, "Transaction not found");
        require(transactions[_transactionId].status != TransactionStatus.DISBURSED, "Cannot cancel disbursed benefit");
        
        transactions[_transactionId].status = TransactionStatus.CANCELLED;
        transactions[_transactionId].failureReason = _reason;
        
        emit BenefitCancelled(_transactionId, _reason);
    }
    
    /**
     * @dev Get transaction details
     */
    function getTransaction(uint256 _transactionId) external view returns (
        address beneficiary,
        SchemeEligibility.SchemeType schemeType,
        uint256 amount,
        TransactionStatus status,
        string memory bankAccount,
        string memory ifscCode,
        uint256 initiatedTime,
        uint256 disbursedTime,
        string memory remarks
    ) {
        BenefitTransaction memory txn = transactions[_transactionId];
        return (
            txn.beneficiary,
            txn.schemeType,
            txn.amount,
            txn.status,
            txn.bankAccount,
            txn.ifscCode,
            txn.initiatedTime,
            txn.disbursedTime,
            txn.remarks
        );
    }
    
    /**
     * @dev Get all transactions for a user
     */
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get scheme statistics
     */
    function getSchemeStats(SchemeEligibility.SchemeType _schemeType) external view returns (
        uint256 totalApplications,
        uint256 totalApproved,
        uint256 totalDisbursed,
        uint256 totalAmount,
        uint256 averageProcessingTime
    ) {
        SchemeStats memory stats = schemeStats[_schemeType];
        return (
            stats.totalApplications,
            stats.totalApproved,
            stats.totalDisbursed,
            stats.totalAmount,
            stats.averageProcessingTime
        );
    }
    
    /**
     * @dev Get transaction status for public tracking
     */
    function trackTransaction(uint256 _transactionId) external view returns (
        TransactionStatus status,
        uint256 initiatedTime,
        uint256 approvedTime,
        uint256 disbursedTime,
        string memory remarks
    ) {
        BenefitTransaction memory txn = transactions[_transactionId];
        return (
            txn.status,
            txn.initiatedTime,
            txn.approvedTime,
            txn.disbursedTime,
            txn.remarks
        );
    }
    
    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        // Implement pause functionality if needed
        // This can stop all new transactions in case of emergency
    }
}