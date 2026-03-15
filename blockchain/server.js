const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import Models
const Citizen = require('./models/Citizen');
const Scheme = require('./models/Scheme');

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myscheme-portal';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    seedInitialData();
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('💡 Starting without MongoDB (blockchain only mode)');
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1,
        version: '1.0.0'
    });
});

// Get all schemes (for display)
app.get('/api/schemes', async (req, res) => {
    try {
        const schemes = await Scheme.find({ isActive: true })
            .select('-__v')
            .sort({ priority: -1, createdAt: -1 });
        
        res.json({
            success: true,
            count: schemes.length,
            data: schemes
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching schemes',
            error: error.message
        });
    }
});

// Get eligible schemes for a citizen
app.post('/api/schemes/eligible', async (req, res) => {
    try {
        const { age, income, gender, state, category } = req.body;
        
        const eligibleSchemes = await Scheme.findEligibleSchemes({
            age: parseInt(age),
            income: parseInt(income),
            gender,
            state,
            category
        });
        
        res.json({
            success: true,
            count: eligibleSchemes.length,
            data: eligibleSchemes
        });
    } catch (error) {
        console.error('Error finding eligible schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding eligible schemes',
            error: error.message
        });
    }
});

// Register citizen
app.post('/api/citizens/register', async (req, res) => {
    try {
        const citizenData = req.body;
        
        // Generate unique citizen ID
        citizenData.citizenId = `CID${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        const citizen = new Citizen(citizenData);
        await citizen.save();
        
        res.status(201).json({
            success: true,
            message: 'Citizen registered successfully',
            data: {
                citizenId: citizen.citizenId,
                name: citizen.name,
                email: citizen.email
            }
        });
    } catch (error) {
        console.error('Error registering citizen:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Citizen already exists with this email or phone'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error registering citizen',
            error: error.message
        });
    }
});

// Apply for scheme
app.post('/api/citizens/:citizenId/apply', async (req, res) => {
    try {
        const { citizenId } = req.params;
        const { schemeId, schemeName } = req.body;
        
        const citizen = await Citizen.findOne({ citizenId });
        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: 'Citizen not found'
            });
        }
        
        // Check if already applied
        const existingApplication = citizen.applications.find(
            app => app.schemeId === schemeId
        );
        
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'Already applied for this scheme'
            });
        }
        
        // Add application
        citizen.applications.push({
            schemeId,
            schemeName,
            status: 'pending',
            eligibilityScore: Math.random() * 100 // Mock score
        });
        
        await citizen.save();
        
        // Update scheme statistics
        await Scheme.findOneAndUpdate(
            { schemeId },
            { $inc: { 'statistics.totalApplications': 1 } }
        );
        
        res.json({
            success: true,
            message: 'Application submitted successfully'
        });
        
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    }
});

// Get citizen profile
app.get('/api/citizens/:citizenId', async (req, res) => {
    try {
        const { citizenId } = req.params;
        
        const citizen = await Citizen.findOne({ citizenId })
            .select('-__v -updatedAt');
        
        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: 'Citizen not found'
            });
        }
        
        res.json({
            success: true,
            data: citizen
        });
        
    } catch (error) {
        console.error('Error fetching citizen:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching citizen data',
            error: error.message
        });
    }
});

// Fallback route - serve main website
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Seed initial data function
async function seedInitialData() {
    try {
        const schemeCount = await Scheme.countDocuments();
        
        if (schemeCount === 0) {
            console.log('🌱 Seeding initial scheme data...');
            
            const initialSchemes = [
                {
                    schemeId: 'PM_KISAN_001',
                    title: 'PM Kisan Yojana',
                    description: 'Direct income support scheme for farmers with landholding up to 2 hectares.',
                    category: 'agriculture',
                    eligibilityCriteria: {
                        maxIncome: 200000,
                        occupation: ['farmer']
                    },
                    benefits: {
                        type: 'monetary',
                        amount: 6000,
                        frequency: 'yearly'
                    },
                    media: {
                        icon: 'fas fa-seedling',
                        image: 'assets/images/schemes/pm-kisan.png',
                        videoId: '87ev--e_zeg'
                    },
                    isActive: true,
                    priority: 10
                },
                {
                    schemeId: 'PM_SCHOLARSHIP_001',
                    title: 'PM Scholarship for Students',
                    description: 'Merit-based scholarship for students pursuing higher education.',
                    category: 'education',
                    eligibilityCriteria: {
                        minAge: 18,
                        maxIncome: 600000
                    },
                    benefits: {
                        type: 'scholarship',
                        amount: 50000,
                        frequency: 'yearly'
                    },
                    media: {
                        icon: 'fas fa-graduation-cap',
                        image: 'assets/images/schemes/pm-scholarship.jpeg',
                        videoId: 'PPXXiCSiAbU'
                    },
                    isActive: true,
                    priority: 9
                },
                {
                    schemeId: 'OLD_AGE_PENSION_001',
                    title: 'Old Age Pension Scheme',
                    description: 'Monthly pension for senior citizens aged 60 and above.',
                    category: 'social-welfare',
                    eligibilityCriteria: {
                        minAge: 60,
                        maxIncome: 100000
                    },
                    benefits: {
                        type: 'pension',
                        amount: 2000,
                        frequency: 'monthly'
                    },
                    media: {
                        icon: 'fas fa-heart',
                        image: 'assets/images/schemes/old-age-pension.jpeg',
                        videoId: 'Zb9lk-v07LI'
                    },
                    isActive: true,
                    priority: 8
                }
            ];
            
            await Scheme.insertMany(initialSchemes);
            console.log('✅ Initial scheme data seeded successfully');
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Main website: http://localhost:${PORT}`);
    console.log(`🔧 API endpoint: http://localhost:${PORT}/api`);
    console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;