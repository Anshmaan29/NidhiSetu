const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
    // Basic Information (MongoDB)
    citizenId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        district: String
    },
    
    // Blockchain Integration
    walletAddress: {
        type: String,
        unique: true,
        sparse: true // Allows null values
    },
    blockchainHash: {
        type: String,
        unique: true,
        sparse: true
    },
    isBlockchainVerified: {
        type: Boolean,
        default: false
    },
    
    // Aadhaar Integration (Hashed)
    aadhaarHash: {
        type: String,
        unique: true,
        sparse: true
    },
    isAadhaarVerified: {
        type: Boolean,
        default: false
    },
    
    // Application History
    applications: [{
        schemeId: String,
        schemeName: String,
        applicationDate: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected', 'processing'],
            default: 'pending'
        },
        blockchainTxHash: String, // Reference to blockchain transaction
        eligibilityScore: Number,
        documents: [{
            fileName: String,
            fileUrl: String,
            uploadDate: { type: Date, default: Date.now }
        }]
    }],
    
    // Analytics & Preferences
    preferences: {
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
    },
    
    // Benefits Received
    benefitsReceived: [{
        schemeId: String,
        schemeName: String,
        amount: Number,
        receiveDate: Date,
        blockchainTxHash: String,
        status: { type: String, enum: ['pending', 'disbursed', 'failed'] }
    }],
    
    // System Fields
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
citizenSchema.index({ email: 1 });
citizenSchema.index({ phone: 1 });
citizenSchema.index({ walletAddress: 1 });
citizenSchema.index({ citizenId: 1 });
citizenSchema.index({ aadhaarHash: 1 });

// Update timestamp on save
citizenSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Citizen', citizenSchema);