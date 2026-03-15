const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    schemeId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['agriculture', 'education', 'health', 'women-welfare', 'social-welfare', 'employment'],
        required: true
    },
    
    // Eligibility Criteria (stored in MongoDB for complex queries)
    eligibilityCriteria: {
        minAge: Number,
        maxAge: Number,
        maxIncome: Number,
        gender: [String], // ['Male', 'Female', 'Other']
        category: [String], // ['General', 'OBC', 'SC', 'ST']
        states: [String], // Applicable states
        education: [String], // Education requirements
        occupation: [String] // Occupation requirements
    },
    
    // Benefit Details
    benefits: {
        type: String, // 'monetary', 'subsidy', 'scholarship', 'pension'
        amount: Number,
        frequency: String, // 'one-time', 'monthly', 'quarterly', 'yearly'
        maxDuration: Number // in months
    },
    
    // Application Statistics
    statistics: {
        totalApplications: { type: Number, default: 0 },
        approvedApplications: { type: Number, default: 0 },
        rejectedApplications: { type: Number, default: 0 },
        totalBeneficiaries: { type: Number, default: 0 },
        totalAmountDisbursed: { type: Number, default: 0 }
    },
    
    // Media & Resources
    media: {
        icon: String,
        image: String,
        videoId: String,
        videoTitle: String,
        brochureUrl: String
    },
    
    // Government Details
    department: {
        name: String,
        ministry: String,
        contactEmail: String,
        officialWebsite: String
    },
    
    // Blockchain Integration
    smartContractAddress: String,
    blockchainEnabled: { type: Boolean, default: true },
    
    // Application Process
    applicationProcess: {
        steps: [String],
        requiredDocuments: [String],
        processingTime: String, // "2-4 weeks"
        applicationFee: { type: Number, default: 0 }
    },
    
    // System Fields
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    priority: { type: Number, default: 0 }, // For sorting/featuring
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
schemeSchema.index({ category: 1 });
schemeSchema.index({ isActive: 1 });
schemeSchema.index({ priority: -1 });
schemeSchema.index({ 'eligibilityCriteria.minAge': 1, 'eligibilityCriteria.maxAge': 1 });
schemeSchema.index({ 'eligibilityCriteria.maxIncome': 1 });

// Update timestamp on save
schemeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to find schemes by eligibility
schemeSchema.statics.findEligibleSchemes = function(citizenData) {
    const { age, income, gender, state, category } = citizenData;
    
    return this.find({
        isActive: true,
        $and: [
            { $or: [
                { 'eligibilityCriteria.minAge': { $lte: age } },
                { 'eligibilityCriteria.minAge': { $exists: false } }
            ]},
            { $or: [
                { 'eligibilityCriteria.maxAge': { $gte: age } },
                { 'eligibilityCriteria.maxAge': { $exists: false } }
            ]},
            { $or: [
                { 'eligibilityCriteria.maxIncome': { $gte: income } },
                { 'eligibilityCriteria.maxIncome': { $exists: false } }
            ]},
            { $or: [
                { 'eligibilityCriteria.gender': { $in: [gender] } },
                { 'eligibilityCriteria.gender': { $size: 0 } }
            ]},
            { $or: [
                { 'eligibilityCriteria.states': { $in: [state] } },
                { 'eligibilityCriteria.states': { $size: 0 } }
            ]}
        ]
    }).sort({ priority: -1 });
};

module.exports = mongoose.model('Scheme', schemeSchema);