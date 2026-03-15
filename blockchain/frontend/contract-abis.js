// Contract ABIs for frontend integration
// These are simplified ABIs with only the functions we need

const CITIZEN_REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "uint256", "name": "_aadhaarHash", "type": "uint256"},
            {"internalType": "string", "name": "_phoneNumber", "type": "string"},
            {"internalType": "uint256", "name": "_age", "type": "uint256"},
            {"internalType": "string", "name": "_gender", "type": "string"},
            {"internalType": "string", "name": "_category", "type": "string"},
            {"internalType": "uint256", "name": "_annualIncome", "type": "uint256"}
        ],
        "name": "registerCitizen",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_citizenAddress", "type": "address"}],
        "name": "getCitizen",
        "outputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "uint256", "name": "age", "type": "uint256"},
            {"internalType": "string", "name": "gender", "type": "string"},
            {"internalType": "string", "name": "category", "type": "string"},
            {"internalType": "uint256", "name": "annualIncome", "type": "uint256"},
            {"internalType": "bool", "name": "isVerified", "type": "bool"},
            {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_citizenAddress", "type": "address"}],
        "name": "isRegistered",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "citizenAddress", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "aadhaarHash", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"}
        ],
        "name": "CitizenRegistered",
        "type": "event"
    }
];

const SCHEME_ELIGIBILITY_ABI = [
    {
        "inputs": [{"internalType": "enum SchemeEligibility.SchemeType", "name": "_schemeType", "type": "uint8"}],
        "name": "applyForScheme",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_applicant", "type": "address"},
            {"internalType": "enum SchemeEligibility.SchemeType", "name": "_schemeType", "type": "uint8"}
        ],
        "name": "getApplicationStatus",
        "outputs": [
            {"internalType": "enum SchemeEligibility.EligibilityStatus", "name": "status", "type": "uint8"},
            {"internalType": "string", "name": "reason", "type": "string"},
            {"internalType": "uint256", "name": "applicationTime", "type": "uint256"},
            {"internalType": "uint256", "name": "decisionTime", "type": "uint256"},
            {"internalType": "bool", "name": "benefitDisbursed", "type": "bool"},
            {"internalType": "uint256", "name": "benefitAmount", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "getUserApplications",
        "outputs": [{"internalType": "enum SchemeEligibility.SchemeType[]", "name": "", "type": "uint8[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "applicant", "type": "address"},
            {"indexed": false, "internalType": "enum SchemeEligibility.SchemeType", "name": "schemeType", "type": "uint8"},
            {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "ApplicationSubmitted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "applicant", "type": "address"},
            {"indexed": false, "internalType": "enum SchemeEligibility.SchemeType", "name": "schemeType", "type": "uint8"},
            {"indexed": false, "internalType": "enum SchemeEligibility.EligibilityStatus", "name": "status", "type": "uint8"},
            {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
        ],
        "name": "EligibilityDecision",
        "type": "event"
    }
];

const BENEFIT_TRACKER_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "_transactionId", "type": "uint256"}],
        "name": "trackTransaction",
        "outputs": [
            {"internalType": "enum BenefitTracker.TransactionStatus", "name": "status", "type": "uint8"},
            {"internalType": "uint256", "name": "initiatedTime", "type": "uint256"},
            {"internalType": "uint256", "name": "approvedTime", "type": "uint256"},
            {"internalType": "uint256", "name": "disbursedTime", "type": "uint256"},
            {"internalType": "string", "name": "remarks", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "getUserTransactions",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "enum SchemeEligibility.SchemeType", "name": "_schemeType", "type": "uint8"}],
        "name": "getSchemeStats",
        "outputs": [
            {"internalType": "uint256", "name": "totalApplications", "type": "uint256"},
            {"internalType": "uint256", "name": "totalApproved", "type": "uint256"},
            {"internalType": "uint256", "name": "totalDisbursed", "type": "uint256"},
            {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
            {"internalType": "uint256", "name": "averageProcessingTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "transactionId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "beneficiary", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "BenefitDisbursed",
        "type": "event"
    }
];