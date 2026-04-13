// MyScheme Portal JavaScript - Modern Version with Animations

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Load saved language preference
    currentLanguage = localStorage.getItem('language') || 'en';
    updateLanguage();
    updateLanguageButton();
    
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
    
    // Initialize all components
    initScrollAnimations();
    initHeaderScroll();
    initModernFeatures();
    populateSchemes();
    initEligibilityChecker();
    initVoiceChat();
    initAccessibility();
    initModalEventListeners();
    initNotifications();
    
    // Clear any wallet connection storage to prevent auto-popup
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('dbtModalShown');
    
    // IMMEDIATE DBT popup - highest priority
    showModal('dbtModal');
    showNotification('📊 Digital Benefit Tracker is ready! Register to access all government schemes.', 'info');
    
    // Backup DBT popup - show immediately after page loads
    setTimeout(() => {
        console.log('Backup: Attempting to show DBT modal...');
        const dbtModal = document.getElementById('dbtModal');
        console.log('DBT Modal element found:', !!dbtModal);
        
        if (dbtModal && dbtModal.style.display !== 'block') {
            showModal('dbtModal');
            showNotification('📊 Digital Benefit Tracker is ready! Register to access all government schemes.', 'info');
            console.log('DBT modal should be visible now');
        }
    }, 500); // Backup after 0.5 seconds
});

// Check wallet connection status and update UI (DISABLED - DBT Priority)
function checkWalletConnection() {
    // Commented out to prevent MetaMask popups - DBT has priority
    console.log('Wallet connection check disabled - DBT popup has priority');
    return;
    
    /* DISABLED CODE
    const walletStatusContent = document.getElementById('walletStatusContent');
    const walletStatusText = document.getElementById('walletStatusText');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (window.ethereum && localStorage.getItem('walletConnected')) {
        // Check if actually connected
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    updateWalletStatus(true, accounts[0]);
                } else {
                    updateWalletStatus(false);
                    localStorage.removeItem('walletConnected');
                }
            })
            .catch(() => {
                updateWalletStatus(false);
                localStorage.removeItem('walletConnected');
            });
    } else {
        updateWalletStatus(false);
    }
    */
}

// Update wallet status in login modal (make globally available)
window.updateWalletStatus = function(connected, address = null) {
    const walletStatusContent = document.getElementById('walletStatusContent');
    const walletStatusText = document.getElementById('walletStatusText');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (connected && address) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        
        // Update modal status
        if (walletStatusContent) {
            walletStatusContent.className = 'wallet-connected';
            walletStatusContent.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Wallet Connected: ${shortAddress}</span>
            `;
        }
    } else {
        // Update modal status
        if (walletStatusContent) {
            walletStatusContent.className = 'wallet-disconnected';
            walletStatusContent.innerHTML = `
                <i class="fas fa-times-circle"></i>
                <span>Wallet Not Connected</span>
            `;
        }
    }
};

// Update wallet status in login modal
function updateWalletStatus(connected, address = null) {
    window.updateWalletStatus(connected, address);
}

// Initialize modal event listeners
function initModalEventListeners() {
    // Login modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showModal('loginModal'));
    }
    
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => hideModal('loginModal'));
    }
    
    // DBT modal
    const dbtModal = document.getElementById('dbtModal');
    const closeDbtModal = document.getElementById('closeDbtModal');
    
    if (closeDbtModal) {
        closeDbtModal.addEventListener('click', () => hideModal('dbtModal'));
    }
    
    // Voice modal
    const voiceChatBtn = document.getElementById('voiceChatBtn');
    const closeVoiceModal = document.getElementById('closeVoiceModal');
    
    if (voiceChatBtn) {
        voiceChatBtn.addEventListener('click', openVoiceChat);
    }
    
    // Blockchain Wallet Button
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async () => {
            try {
                if (window.blockchain) {
                    const result = await window.blockchain.connectWallet();
                    if (result) {
                        // Update wallet status after successful connection
                        setTimeout(() => {
                            checkWalletConnection();
                        }, 1000);
                    }
                } else {
                    showNotification('MetaMask not detected. Please install MetaMask.', 'error');
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
                showNotification('Failed to connect wallet. Please try again.', 'error');
            }
        });
    }
    
    // Register on Blockchain Button
    const registerOnBlockchainBtn = document.getElementById('registerOnBlockchainBtn');
    if (registerOnBlockchainBtn) {
        registerOnBlockchainBtn.addEventListener('click', async () => {
            try {
                if (!window.blockchain || !window.blockchain.isConnected) {
                    alert('Please connect your wallet first.');
                    return;
                }
                
                // Get form data
                const formData = {
                    name: document.getElementById('userName').value,
                    aadhaarNumber: document.getElementById('userAadhaar').value,
                    phoneNumber: document.getElementById('userPhone').value,
                    age: parseInt(document.getElementById('userAge').value),
                    gender: document.getElementById('userGender').value,
                    category: document.getElementById('userCategory').value,
                    annualIncome: parseInt(document.getElementById('userIncome').value)
                };
                
                // Validate form
                if (!formData.name || !formData.aadhaarNumber || !formData.phoneNumber) {
                    alert('Please fill all required fields.');
                    return;
                }
                
                // Save to MongoDB first (optional - doesn't break if it fails)
                const mongoResult = await window.mongoService.registerCitizen({
                    name: formData.name,
                    email: formData.email || `${formData.phoneNumber}@example.com`, // Generate email if not provided
                    phone: formData.phoneNumber,
                    dateOfBirth: new Date(new Date().getFullYear() - formData.age, 0, 1), // Approximate DOB
                    gender: formData.gender,
                    address: {
                        state: 'Demo State',
                        city: 'Demo City'
                    },
                    aadhaarHash: btoa(formData.aadhaarNumber), // Simple encoding for demo
                    isAadhaarVerified: true
                });
                
                if (mongoResult) {
                    // Store citizen ID for future use
                    localStorage.setItem('citizenId', mongoResult.citizenId);
                    console.log('✅ Citizen saved to MongoDB with ID:', mongoResult.citizenId);
                }
                
                // Register on blockchain
                await window.blockchain.registerCitizen(formData);
                
            } catch (error) {
                console.error('Error registering on blockchain:', error);
            }
        });
    }
    
    if (closeVoiceModal) {
        closeVoiceModal.addEventListener('click', () => hideModal('voiceModal'));
    }
    
    // Language dropdown
    const languageToggle = document.getElementById('languageToggle');
    const languageMenu = document.getElementById('languageMenu');
    const languageOptions = document.querySelectorAll('.language-option');
    
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguageMenu);
    }
    
    // Handle language option clicks
    languageOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const lang = e.currentTarget.getAttribute('data-lang');
            setLanguage(lang);
            hideLanguageMenu();
        });
    });
    
    // Close language menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!languageToggle.contains(e.target) && !languageMenu.contains(e.target)) {
            hideLanguageMenu();
        }
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Initialize dark mode from localStorage
    initDarkMode();
    
    // DBT verification handlers
    const verifyAccountBtn = document.getElementById('verifyAccountBtn');
    const checkOnlineBtn = document.getElementById('checkOnlineBtn');
    const translateDbtBtn = document.getElementById('translateDbtBtn');
    
    if (verifyAccountBtn) {
        verifyAccountBtn.addEventListener('click', verifyDBTAccount);
    }
    
    if (checkOnlineBtn) {
        checkOnlineBtn.addEventListener('click', () => {
            window.open('https://pfms.nic.in/static/NewLayoutBeneficiary.aspx', '_blank');
        });
    }
    
    if (translateDbtBtn) {
        translateDbtBtn.addEventListener('click', toggleDBTLanguage);
    }
    
    // Initialize login slider
    initLoginSlider();
    
    // Initialize SMS support
    initSMSSupport();
    
    // Add DBT test button (for debugging)
    console.log('DBT Modal element exists:', !!document.getElementById('dbtModal'));
    
    // Test DBT popup after a short delay
    setTimeout(() => {
        console.log('Attempting to show DBT modal...');
        showDBTInfo();
    }, 1000);
}

// Initialize notifications
function initNotifications() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('show');
        });
    }
    
    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationsDropdown && !notificationsBtn.contains(e.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });
}

// MongoDB API Service (Optional - works alongside existing data)
class MongoDBService {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.isConnected = false;
        this.checkConnection();
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const data = await response.json();
            this.isConnected = data.mongodb;
            
            if (this.isConnected) {
                console.log('✅ MongoDB backend connected');
                // Load schemes from MongoDB if available
                this.loadSchemesFromMongoDB();
            } else {
                console.log('📦 Using local scheme data (MongoDB not available)');
            }
        } catch (error) {
            console.log('📦 MongoDB backend not available, using local data');
            this.isConnected = false;
        }
    }
    
    async loadSchemesFromMongoDB() {
        try {
            const response = await fetch(`${this.apiBase}/schemes`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                // Update schemes data with MongoDB data
                window.mongoSchemes = data.data;
                console.log(`📊 Loaded ${data.data.length} schemes from MongoDB`);
            }
        } catch (error) {
            console.log('Using local scheme data as fallback');
        }
    }
    
    async registerCitizen(citizenData) {
        if (!this.isConnected) return null;
        
        try {
            const response = await fetch(`${this.apiBase}/citizens/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(citizenData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('✅ Citizen registered in database!', 'success');
                return data.data;
            } else {
                console.log('MongoDB registration failed:', data.message);
                return null;
            }
        } catch (error) {
            console.log('MongoDB registration error:', error);
            return null;
        }
    }
    
    async applyForScheme(citizenId, schemeData) {
        if (!this.isConnected || !citizenId) return null;
        
        try {
            const response = await fetch(`${this.apiBase}/citizens/${citizenId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(schemeData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('✅ Application saved to database!', 'success');
                return data;
            }
        } catch (error) {
            console.log('MongoDB application error:', error);
        }
        return null;
    }
    
    async getEligibleSchemes(eligibilityData) {
        if (!this.isConnected) return [];
        
        try {
            const response = await fetch(`${this.apiBase}/schemes/eligible`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eligibilityData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
        } catch (error) {
            console.log('MongoDB eligibility check error:', error);
        }
        return [];
    }
}

// Initialize MongoDB service
window.mongoService = new MongoDBService();

// Sample schemes data with images and videos
const schemes = [
    {
        id: 1,
        title: "PM Kisan Yojana",
        category: "agriculture",
        description: "Direct income support scheme for farmers with landholding up to 2 hectares. Provides ₹6,000 per year in three equal installments.",
        eligibility: [
            "Must be a farmer",
            "Landholding up to 2 hectares",
            "Valid Aadhaar number",
            "Bank account linked to Aadhaar"
        ],
        officialLink: "https://pmkisan.gov.in",
        icon: "fas fa-seedling",
        color: "#4CAF50",
        image: "assets/images/schemes/pm-kisan.png",
        videoId: "87ev--e_zeg",
        videoTitle: "PM Kisan Yojana Explained"
    },
    {
        id: 2,
        title: "PM Scholarship for Students",
        category: "education",
        description: "Merit-based scholarship for students pursuing higher education. Available for students aged 18+ with good academic performance.",
        eligibility: [
            "Age 18 years or above",
            "Enrolled in higher education",
            "Minimum 60% marks in previous exam",
            "Family income below ₹6 lakhs per annum"
        ],
        officialLink: "https://scholarships.gov.in",
        icon: "fas fa-graduation-cap",
        color: "#2196F3",
        image: "assets/images/schemes/pm-scholarship.jpeg",
        videoId: "PPXXiCSiAbU",
        videoTitle: "PM Scholarship Guide"
    },
    {
        id: 3,
        title: "Old Age Pension Scheme",
        category: "social-welfare",
        description: "Monthly pension for senior citizens aged 60 and above. Provides financial support for elderly citizens.",
        eligibility: [
            "Age 60 years or above",
            "Annual income below ₹1 lakh",
            "Valid Aadhaar number",
            "Bank account linked to Aadhaar"
        ],
        officialLink: "https://nsap.nic.in",
        icon: "fas fa-heart",
        color: "#FF9800",
        image: "assets/images/schemes/old-age-pension.jpeg",
        videoId: "Zb9lk-v07LI",
        videoTitle: "Old Age Pension Process"
    },
    {
        id: 4,
        title: "PM Ujjwala Yojana",
        category: "women-welfare",
        description: "Free LPG connection for women from Below Poverty Line (BPL) households. Empowers women and improves health.",
        eligibility: [
            "Female head of household",
            "BPL family status",
            "No existing LPG connection",
            "Valid Aadhaar number"
        ],
        officialLink: "https://pmujjwalayojana.com",
        icon: "fas fa-fire",
        color: "#E91E63",
        image: "assets/images/schemes/pm-ujjwala.jpeg",
        videoId: "VrJmrJJUTKU",
        videoTitle: "PM Ujjwala Yojana Benefits"
    }
];

// Modern Scroll Animations
function initScrollAnimations() {
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.scheme-card, .category-card, .hero-card').forEach(el => {
        observer.observe(el);
    });

    // Parallax scrolling for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-background');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effects
function initHeaderScroll() {
    const header = document.querySelector('.header');
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Add some modern scroll behaviors
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Voice assistant active state management
    const voiceBtn = document.getElementById('voiceChatBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            voiceBtn.classList.toggle('active');
        });
    }
    
    // Language dropdown functionality
    const languageToggle = document.getElementById('languageToggle');
    const languageMenu = document.getElementById('languageMenu');
    const languageDropdown = document.querySelector('.language-dropdown');
    
    if (languageToggle && languageMenu) {
        languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            languageMenu.classList.toggle('show');
            languageDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            languageMenu.classList.remove('show');
            languageDropdown.classList.remove('active');
        });
    }
}

// Modern interactive features
function initModernFeatures() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add hover effects to category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Staggered animation for scheme cards
    const schemeCards = document.querySelectorAll('.scheme-card');
    schemeCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Populate schemes with modern card design
function populateSchemes() {
    const schemesGrid = document.querySelector('.schemes-grid');
    if (!schemesGrid) return;

    schemesGrid.innerHTML = '';

    schemes.forEach((scheme, index) => {
        const schemeCard = document.createElement('div');
        schemeCard.className = 'scheme-card';
        schemeCard.setAttribute('data-aos', 'fade-up');
        schemeCard.setAttribute('data-aos-delay', `${index * 100}`);
        
        schemeCard.innerHTML = `
            <div class="scheme-image" style="background-image: url('${scheme.image}');">
                <div class="scheme-overlay">
                    <button class="play-btn" onclick="showSchemeVideo('${scheme.videoId}', '${scheme.videoTitle}')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <div class="scheme-content">
                <div class="scheme-header">
                    <h3 class="scheme-title">${scheme.title}</h3>
                    <span class="scheme-category" style="background: ${scheme.color};">
                        <i class="${scheme.icon}"></i>
                        ${scheme.category.replace('-', ' ')}
                    </span>
                </div>
                <p class="scheme-description">${scheme.description}</p>
                <div class="eligibility-criteria">
                    <h4><i class="fas fa-check-circle" style="color: #4CAF50;"></i> Eligibility Criteria:</h4>
                    <ul>
                        ${scheme.eligibility.map(criteria => `<li><i class="fas fa-check" style="color: #4CAF50;"></i> ${criteria}</li>`).join('')}
                    </ul>
                </div>
                <div class="scheme-actions">
                    <button class="btn btn-outline" onclick="window.open('${scheme.officialLink}', '_blank')">
                        <i class="fas fa-external-link-alt"></i>
                        Official Site
                    </button>
                    <button class="btn btn-primary" onclick="showSchemeVideo('${scheme.videoId}', '${scheme.videoTitle}')">
                        <i class="fas fa-play"></i>
                        Watch Guide
                    </button>
                </div>
                <div class="scheme-benefits">
                    <div class="benefit-tag">
                        <i class="fas fa-shield-alt"></i>
                        Government Verified
                    </div>
                    <div class="benefit-tag">
                        <i class="fas fa-clock"></i>
                        Quick Apply
                    </div>
                </div>
            </div>
        `;
        
        schemesGrid.appendChild(schemeCard);
        
        // Add hover effect
        schemeCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.03)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
        });
        
        schemeCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
    });

    // Refresh AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Show scheme video — open on YouTube directly
function showSchemeVideo(videoId, title) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

// Enhanced Eligibility Checker
function initEligibilityChecker() {
    // Check if eligibility button exists and add event listener
    const eligibilityBtn = document.getElementById('checkEligibilityFormBtn');
    if (eligibilityBtn) {
        eligibilityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            checkEligibility();
        });
    }

    // Also handle form submission if form exists
    const form = document.querySelector('.eligibility-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            checkEligibility();
        });
    }
}

function showEligibilityChecker() {
    const section = document.getElementById('eligibilitySection');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showEligibilityResults() {
    const age = parseInt(document.getElementById('age').value);
    const income = parseInt(document.getElementById('income').value);
    const gender = document.getElementById('gender').value;

    const eligibleSchemes = schemes.filter(scheme => {
        // Simple eligibility logic - can be enhanced
        if (scheme.category === 'education' && age < 18) return false;
        if (scheme.category === 'social-welfare' && age < 60) return false;
        if (scheme.category === 'women-welfare' && gender !== 'female') return false;
        return true;
    });

    // Show results with animation
    const resultsHtml = `
        <div class="eligibility-results" data-aos="fade-up">
            <h3>🎉 You are eligible for ${eligibleSchemes.length} schemes!</h3>
            <div class="eligible-schemes">
                ${eligibleSchemes.map(scheme => `
                    <div class="eligible-scheme" data-aos="slide-up" data-aos-delay="100">
                        <div class="eligible-scheme-info">
                            <h4><i class="${scheme.icon}"></i> ${scheme.title}</h4>
                            <p>${scheme.description}</p>
                            <button class="btn btn-primary btn-small" onclick="window.open('${scheme.officialLink}', '_blank')">
                                Apply Now
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const form = document.querySelector('.eligibility-form');
    form.insertAdjacentHTML('afterend', resultsHtml);
    AOS.refresh();
}

// Show MongoDB eligibility results (enhanced format)
function showMongoEligibilityResults(mongoSchemes) {
    const form = document.querySelector('.eligibility-form');
    if (!form) return;
    
    // Remove existing results
    const existingResults = document.querySelector('.eligibility-results');
    if (existingResults) {
        existingResults.remove();
    }
    
    const resultsHtml = `
        <div class="eligibility-results" data-aos="fade-up">
            <div class="mongo-badge">
                <i class="fas fa-database"></i> Enhanced Database Results
            </div>
            <h3>🎉 You are eligible for ${mongoSchemes.length} schemes!</h3>
            <p class="results-subtitle">Based on advanced eligibility analysis from our database</p>
            <div class="eligible-schemes">
                ${mongoSchemes.map(scheme => `
                    <div class="eligible-scheme enhanced" data-aos="slide-up" data-aos-delay="100">
                        <div class="scheme-header">
                            <i class="${scheme.media?.icon || 'fas fa-star'}"></i>
                            <h4>${scheme.title}</h4>
                            <span class="scheme-category">${scheme.category}</span>
                        </div>
                        <div class="eligible-scheme-info">
                            <p>${scheme.description}</p>
                            <div class="scheme-benefits">
                                <strong>Benefits:</strong> 
                                ₹${scheme.benefits?.amount?.toLocaleString() || 'Variable'} 
                                (${scheme.benefits?.frequency || 'As applicable'})
                            </div>
                            <div class="scheme-stats">
                                <small>👥 ${scheme.statistics?.totalBeneficiaries || 0} beneficiaries</small>
                                <small>📊 ${scheme.statistics?.totalApplications || 0} applications</small>
                            </div>
                        </div>
                        <div class="scheme-actions">
                            <button class="btn btn-primary btn-small" onclick="applyToScheme('${scheme.schemeId}', '${scheme.title}')">
                                Apply Now
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="window.open('${scheme.department?.officialWebsite || '#'}', '_blank')">
                                Learn More
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <style>
            .mongo-badge {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9em;
                margin-bottom: 15px;
                display: inline-block;
            }
            .eligible-scheme.enhanced {
                border-left: 4px solid #4CAF50;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            }
            .scheme-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .scheme-category {
                background: #007bff;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.8em;
                margin-left: auto;
            }
            .scheme-benefits {
                background: #e8f5e8;
                padding: 8px;
                border-radius: 5px;
                margin: 10px 0;
            }
            .scheme-stats {
                display: flex;
                gap: 15px;
                margin-top: 10px;
                color: #666;
            }
            .scheme-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
        </style>
    `;
    
    form.insertAdjacentHTML('afterend', resultsHtml);
    AOS.refresh();
    
    // Show success notification
    showNotification(`✅ Found ${mongoSchemes.length} eligible schemes using enhanced database search!`, 'success');
}

// Apply to scheme function (for MongoDB schemes)
async function applyToScheme(schemeId, schemeName) {
    const citizenId = localStorage.getItem('citizenId');
    
    if (!citizenId) {
        showNotification('⚠️ Please register first to apply for schemes', 'warning');
        showModal('registerModal');
        return;
    }
    
    if (window.mongoService.isConnected) {
        const result = await window.mongoService.applyForScheme(citizenId, {
            schemeId,
            schemeName
        });
        
        if (result) {
            showNotification(`✅ Successfully applied for ${schemeName}!`, 'success');
        } else {
            showNotification(`❌ Failed to apply for ${schemeName}. Please try again.`, 'error');
        }
    } else {
        showNotification(`📝 Application for ${schemeName} noted. MongoDB service not available.`, 'info');
    }
}

// Enhanced Voice Chat
function initVoiceChat() {
    window.voiceRecognition = null;
    window.isListening = false;
}

function openVoiceChat() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'voiceModal';
    modal.innerHTML = `
        <div class="modal-content voice-modal">
            <div class="modal-header">
                <h2>🎤 Voice Assistant</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="voice-interface">
                    <div class="voice-animation">
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring"></div>
                        <div class="mic-icon">
                            <i class="fas fa-microphone"></i>
                        </div>
                    </div>
                    <div class="voice-status">
                        <p>Click the microphone and ask about government schemes</p>
                    </div>
                    <div class="voice-controls">
                        <button class="btn btn-primary" onclick="toggleVoiceRecognition()">
                            <i class="fas fa-microphone"></i>
                            Start Listening
                        </button>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-message bot">
                        Hello! I can help you find government schemes. Try asking: "What schemes are available for farmers?" or "Show me education schemes"
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        initSpeechRecognition();
    }
}

function toggleVoiceRecognition() {
    if (!window.voiceRecognition) return;
    
    if (window.isListening) {
        window.voiceRecognition.stop();
    } else {
        window.voiceRecognition.start();
    }
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    window.voiceRecognition = new SpeechRecognition();
    
    window.voiceRecognition.continuous = false;
    window.voiceRecognition.interimResults = false;
    window.voiceRecognition.lang = 'en-US';
    
    window.voiceRecognition.onstart = function() {
        window.isListening = true;
        document.querySelector('.voice-status p').textContent = 'Listening... Speak now!';
        document.querySelector('.voice-animation').classList.add('listening');
    };
    
    window.voiceRecognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        addChatMessage(transcript, 'user');
        processVoiceCommand(transcript);
    };
    
    window.voiceRecognition.onend = function() {
        window.isListening = false;
        document.querySelector('.voice-status p').textContent = 'Click the microphone to speak';
        document.querySelector('.voice-animation').classList.remove('listening');
    };
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processVoiceCommand(command) {
    const lowerCommand = command.toLowerCase();
    let response = '';
    
    if (lowerCommand.includes('farmer') || lowerCommand.includes('agriculture')) {
        response = 'I found schemes for farmers! PM Kisan Yojana provides ₹6,000 per year for farmers with up to 2 hectares of land.';
    } else if (lowerCommand.includes('education') || lowerCommand.includes('student')) {
        response = 'For education, there\'s the PM Scholarship scheme for students aged 18+ with good academic performance.';
    } else if (lowerCommand.includes('women') || lowerCommand.includes('female')) {
        response = 'PM Ujjwala Yojana provides free LPG connections for women from BPL households.';
    } else if (lowerCommand.includes('pension') || lowerCommand.includes('elderly')) {
        response = 'Old Age Pension Scheme provides monthly pension for senior citizens aged 60 and above.';
    } else {
        response = 'I can help you with information about government schemes for farmers, students, women, and senior citizens. What specific category interests you?';
    }
    
    setTimeout(() => {
        addChatMessage(response, 'bot');
    }, 1000);
}

// Enhanced Accessibility
function initAccessibility() {
    // Make sure accessibility panel exists and is properly set up
    const panel = document.getElementById('accessibilityPanel');
    if (panel) {
        const toggle = document.getElementById('accessibilityToggle');
        if (toggle) {
            toggle.addEventListener('click', toggleAccessibilityMenu);
        }
        
        // Set up checkbox click handlers
        const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', function() {
                const checkmark = this.nextElementSibling;
                if (this.checked) {
                    checkmark.style.background = '#667eea';
                    checkmark.innerHTML = '✓';
                    checkmark.style.color = 'white';
                } else {
                    checkmark.style.background = 'transparent';
                    checkmark.innerHTML = '';
                }
                
                // Handle functionality
                if (index === 0) toggleHighContrast(this);
                if (index === 1) toggleLargeText(this);
                if (index === 2) toggleReducedMotion(this);
            });
        });
    }
}

function toggleAccessibilityMenu() {
    const menu = document.getElementById('accessibilityMenu');
    if (menu) {
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            menu.classList.add('show');
        } else {
            menu.classList.remove('show');
        }
    }
}

function toggleHighContrast(checkbox) {
    document.body.classList.toggle('high-contrast', checkbox.checked);
}

function toggleLargeText(checkbox) {
    document.body.classList.toggle('large-text', checkbox.checked);
}

function toggleReducedMotion(checkbox) {
    document.body.classList.toggle('reduced-motion', checkbox.checked);
    if (checkbox.checked) {
        if (typeof AOS !== 'undefined') {
            AOS.init({ disable: true });
        }
    } else {
        if (typeof AOS !== 'undefined') {
            AOS.init({ disable: false });
        }
    }
}

// Modal functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Login functionality
function showLogin() {
    showModal('loginModal');
}

function showDBTInfo() {
    console.log('showDBTInfo function called');
    
    const modal = document.getElementById('dbtModal');
    console.log('DBT Modal element:', modal);
    
    if (!modal) {
        console.error('DBT Modal not found!');
        return;
    }
    
    console.log('Showing DBT modal...');
    showModal('dbtModal');
    
    // Store that we've shown it today (uncomment this line to enable once-per-day limit)
    // localStorage.setItem('dbtInfoShown', new Date().toDateString());
}

// Function to show DBT modal (for menu clicks)
function showDbtModal() {
    console.log('showDbtModal called from menu');
    showModal('dbtModal');
}

// Make functions globally available
window.showDBTInfo = showDBTInfo;
window.showDbtModal = showDbtModal;

// Language toggle function
function toggleLanguage() {
    const body = document.body;
    const langText = document.getElementById('langText');
    
    if (body.classList.contains('hindi')) {
        body.classList.remove('hindi');
        langText.textContent = 'हिंदी';
        // Switch to English
        updateLanguage('en');
    } else {
        body.classList.add('hindi');
        langText.textContent = 'English';
        // Switch to Hindi
        updateLanguage('hi');
    }
}

// Dark mode functions
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateDarkModeButton(true);
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark';
    
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('darkMode', 'false');
        updateDarkModeButton(false);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
        updateDarkModeButton(true);
    }
}

function updateDarkModeButton(isDark) {
    const darkModeText = document.getElementById('darkModeText');
    const darkModeIcon = document.querySelector('#darkModeToggle i');
    
    if (isDark) {
        darkModeText.textContent = 'Light Mode';
        darkModeIcon.className = 'fas fa-sun';
    } else {
        darkModeText.textContent = 'Dark Mode';
        darkModeIcon.className = 'fas fa-moon';
    }
}

// DBT Account Verification
function verifyDBTAccount() {
    const accountNumber = document.getElementById('dbtAccountNumber').value;
    const aadhaarNumber = document.getElementById('dbtAadhaarNumber').value;
    const mobileNumber = document.getElementById('dbtMobileNumber').value;
    const resultDiv = document.getElementById('verificationResult');
    const messageElement = document.getElementById('verificationMessage');
    const resultIcon = document.querySelector('.result-icon');
    const progressBar = document.getElementById('dbtProgressBar');
    const progressFill = document.querySelector('.progress-fill');
    
    // Basic validation
    if (!accountNumber || !aadhaarNumber || !mobileNumber) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (aadhaarNumber.length !== 12) {
        alert('Aadhaar number must be 12 digits.');
        return;
    }
    
    if (mobileNumber.length !== 10) {
        alert('Mobile number must be 10 digits.');
        return;
    }
    
    // Show progress bar
    progressBar.style.display = 'block';
    progressFill.style.width = '0%';
    
    // Show loading state
    const verifyBtn = document.getElementById('verifyAccountBtn');
    const originalText = verifyBtn.innerHTML;
    verifyBtn.innerHTML = '<div class="loading-spinner"></div> Verifying Account...';
    verifyBtn.disabled = true;
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
    }, 200);
    
    // Simulate API call (replace with actual verification logic)
    setTimeout(() => {
        // Complete progress bar
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        
        // Mock verification result
        const isVerified = Math.random() > 0.3; // 70% chance of verification success
        
        
        setTimeout(() => {
            // Hide progress bar
            progressBar.style.display = 'none';
            
            if (isVerified) {
                resultIcon.className = 'result-icon';
                resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                messageElement.textContent = `✅ Account ${accountNumber.slice(-4)} is properly linked with Aadhaar. You can receive DBT benefits.`;
                
                // Show success animation
                verifyBtn.innerHTML = '<div class="success-checkmark"></div> Account Verified!';
                verifyBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                
                // Add recommendation section
                setTimeout(() => {
                    showSchemeRecommendations();
                }, 1000);
            } else {
                resultIcon.className = 'result-icon error';
                resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                messageElement.textContent = `⚠️ Account ${accountNumber.slice(-4)} is not properly seeded with Aadhaar. Please visit your bank to link your account.`;
            }
            
            resultDiv.style.display = 'block';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                verifyBtn.innerHTML = originalText;
                verifyBtn.style.background = '';
                verifyBtn.disabled = false;
            }, 3000);
        }, 500);
    }, 2500);
}

// Show scheme recommendations after successful verification
function showSchemeRecommendations() {
    const recommendationsDiv = document.getElementById('schemeRecommendations');
    if (recommendationsDiv) {
        recommendationsDiv.style.display = 'block';
    }
}

// Show eligible schemes (placeholder function)
function showEligibleSchemes() {
    alert('🎉 Based on your profile, you are eligible for:\n\n1. PM-KISAN Scheme - Direct income support for farmers\n2. Pradhan Mantri Awas Yojana - Housing for all\n\nClick OK to explore these schemes!');
    
    // Close DBT modal and highlight these schemes
    closeDbtModal();
    
    // Scroll to schemes section and highlight eligible ones
    setTimeout(() => {
        const schemesSection = document.querySelector('.schemes-grid');
        if (schemesSection) {
            schemesSection.scrollIntoView({ behavior: 'smooth' });
            
            // Add highlight effect to eligible schemes
            const eligibleSchemes = document.querySelectorAll('[data-scheme="pm-kisan"], [data-scheme="pmay"]');
            eligibleSchemes.forEach(scheme => {
                scheme.style.border = '3px solid #FFD700';
                scheme.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
                scheme.style.animation = 'eligibleSchemeGlow 1.5s ease-in-out 3';
            });
        }
    }, 500);
}

function toggleDBTLanguage() {
    const currentLang = currentLanguage || 'en';
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    
    // Update DBT specific elements
    setLanguage(newLang);
    
    // Update the translate button text
    const translateBtn = document.getElementById('translateDbtBtn');
    const translateText = document.getElementById('translateDbtText');
    
    if (newLang === 'hi') {
        translateText.textContent = 'Read in English';
    } else {
        translateText.textContent = 'हिंदी में पढ़ें';
    }
}

function updateLanguage(lang) {
    // Update all translatable elements
    const translation = translations[lang];
    
    // Update header elements
    document.getElementById('langText').textContent = translation.langText;
    document.getElementById('voiceText').textContent = translation.voiceText;
    document.getElementById('loginText').textContent = translation.loginText;
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title .title-line:nth-child(2)');
    if (heroTitle) heroTitle.textContent = translation.heroTitle || 'Government Schemes Made Simple';
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = translation.heroSubtitle;
    
    // Update buttons
    const findSchemesBtn = document.querySelector('.btn-primary');
    if (findSchemesBtn && findSchemesBtn.textContent.includes('Find')) {
        findSchemesBtn.innerHTML = `<i class="fas fa-search"></i> ${translation.findSchemesText}`;
    }
    
    // Update section titles
    const featuredTitle = document.querySelector('.featured-schemes .section-title');
    if (featuredTitle) featuredTitle.textContent = translation.featuredSchemesTitle;
    
    const categoriesTitle = document.querySelector('.scheme-categories .section-title');
    if (categoriesTitle) categoriesTitle.textContent = translation.browseCategoriesTitle || 'Browse by Category';
    
    const categoriesSubtitle = document.querySelector('.scheme-categories .section-subtitle');
    if (categoriesSubtitle) categoriesSubtitle.textContent = translation.browseCategoriesSubtitle || 'Explore schemes tailored to your needs across different sectors';
    
    // Update modal content if visible
    updateModalLanguage(lang);
    
    console.log('Language switched to:', lang);
}

function updateModalLanguage(lang) {
    const translation = translations[lang];
    
    // Update login modal
    const loginTitle = document.getElementById('loginTitle');
    if (loginTitle) loginTitle.textContent = translation.loginTitle;
    
    const nameLabel = document.getElementById('nameLabel');
    if (nameLabel) nameLabel.textContent = translation.nameLabel;
    
    const ageLabel = document.getElementById('ageLabel');
    if (ageLabel) ageLabel.textContent = translation.ageLabel;
    
    const emailLabel = document.getElementById('emailLabel');
    if (emailLabel) emailLabel.textContent = translation.emailLabel;
    
    const phoneLabel = document.getElementById('phoneLabel');
    if (phoneLabel) phoneLabel.textContent = translation.phoneLabel;
    
    const genderLabel = document.getElementById('genderLabel');
    if (genderLabel) genderLabel.textContent = translation.genderLabel;
    
    const categoryLabel = document.getElementById('categoryLabel');
    if (categoryLabel) categoryLabel.textContent = translation.categoryLabel;
    
    const aadhaarLabel = document.getElementById('aadhaarLabel');
    if (aadhaarLabel) aadhaarLabel.textContent = translation.aadhaarLabel;
    
    const createAccountText = document.getElementById('createAccountText');
    if (createAccountText) createAccountText.textContent = translation.createAccountText;
    
    // Update DBT modal
    const dbtTitle = document.getElementById('dbtTitle');
    if (dbtTitle) dbtTitle.textContent = translation.dbtTitle;
    
    const dbtWhatTitle = document.getElementById('dbtWhatTitle');
    if (dbtWhatTitle) dbtWhatTitle.textContent = translation.dbtWhatTitle;
    
    const dbtDescription = document.getElementById('dbtDescription');
    if (dbtDescription) dbtDescription.textContent = translation.dbtDescription;
    
    const checkAccountTitle = document.getElementById('checkAccountTitle');
    if (checkAccountTitle) checkAccountTitle.textContent = translation.checkAccountTitle;
    
    const checkAccountDesc = document.getElementById('checkAccountDesc');
    if (checkAccountDesc) checkAccountDesc.textContent = translation.checkAccountDesc;
    
    const accountNumberLabel = document.getElementById('accountNumberLabel');
    if (accountNumberLabel) accountNumberLabel.textContent = translation.accountNumberLabel;
    
    const dbtAadhaarLabel = document.getElementById('dbtAadhaarLabel');
    if (dbtAadhaarLabel) dbtAadhaarLabel.textContent = translation.dbtAadhaarLabel;
    
    const dbtMobileLabel = document.getElementById('dbtMobileLabel');
    if (dbtMobileLabel) dbtMobileLabel.textContent = translation.dbtMobileLabel;
    
    const verifyAccountBtnText = document.getElementById('verifyAccountBtnText');
    if (verifyAccountBtnText) verifyAccountBtnText.textContent = translation.verifyAccountBtnText;
    
    const checkOnlineBtnText = document.getElementById('checkOnlineBtnText');
    if (checkOnlineBtnText) checkOnlineBtnText.textContent = translation.checkOnlineBtnText;
    
    // Update support text
    const whatsappText = document.getElementById('whatsappText');
    if (whatsappText) whatsappText.textContent = translation.whatsappText;
    
    const smsText = document.getElementById('smsText');
    if (smsText) smsText.textContent = translation.smsText;
    
    // Update accessibility
    const accessibilityTitle = document.getElementById('accessibilityTitle');
    if (accessibilityTitle) accessibilityTitle.textContent = translation.accessibilityTitle;
    
    // Update voice assistant
    const voiceAssistantTitle = document.getElementById('voiceAssistantTitle');
    if (voiceAssistantTitle) voiceAssistantTitle.textContent = translation.voiceAssistantTitle;
    
    const voiceStatusText = document.getElementById('voiceStatusText');
    if (voiceStatusText) voiceStatusText.textContent = translation.voiceStatusText;
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    .voice-animation.listening .pulse-ring {
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(0.33);
            opacity: 1;
        }
        80%, 100% {
            transform: scale(2.4);
            opacity: 0;
        }
    }
    
    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);

// Translation data
const translations = {
    en: {
        // Header
        langText: "हिंदी",
        voiceText: "Voice Assistant",
        loginText: "Login",
        
        // Login Modal
        loginTitle: "Create Account",
        nameLabel: "Full Name",
        ageLabel: "Age",
        emailLabel: "Email",
        phoneLabel: "Phone Number",
        incomeLabel: "Annual Income (₹)",
        genderLabel: "Gender",
        categoryLabel: "Category",
        educationLabel: "Education Level",
        occupationLabel: "Occupation",
        aadhaarLabel: "Aadhaar Number",
        selectGender: "Select Gender",
        maleOption: "Male",
        femaleOption: "Female",
        otherOption: "Other",
        selectCategory: "Select Category",
        generalOption: "General",
        obcOption: "OBC",
        scOption: "SC",
        stOption: "ST",
        selectEducation: "Select Education",
        illiterateOption: "Illiterate",
        primaryOption: "Primary",
        secondaryOption: "Secondary",
        higherSecondaryOption: "Higher Secondary",
        graduateOption: "Graduate",
        postGraduateOption: "Post Graduate",
        selectOccupation: "Select Occupation",
        farmerOption: "Farmer",
        studentOption: "Student",
        unemployedOption: "Unemployed",
        employedOption: "Employed",
        businessOption: "Business",
        otherOccupationOption: "Other",
        notificationTitle: "Notification Preferences",
        emailPref: "Email Notifications",
        smsPref: "SMS Notifications",
        whatsappPref: "WhatsApp Notifications",
        privacyText: "I agree to store my data for scheme eligibility notifications and give permission to contact me via selected methods.",
        createAccountText: "Create Account",
        
        // Notification Preferences
        notificationPrefsTitle: "Notification Preferences",
        notificationPrefsDesc: "Choose how you'd like to receive updates about scheme eligibility and benefits:",
        whatsappNotifTitle: "WhatsApp Notifications",
        whatsappNotifDesc: "Get instant updates on your WhatsApp",
        smsNotifTitle: "SMS Notifications",
        smsNotifDesc: "Receive text messages on your mobile",
        
        // DBT Modal
        dbtTitle: "DBT Account Awareness",
        dbtWhatTitle: "What is DBT?",
        dbtDescription: "Direct Benefit Transfer (DBT) ensures government benefits are directly credited to your bank account linked with Aadhaar.",
        checkAccountTitle: "Check Your Account Status",
        checkAccountDesc: "Verify if your bank account is properly seeded with Aadhaar for receiving government benefits.",
        checkAccountBtnText: "Check My Account",
        
        // Voice Assistant
        voiceAssistantTitle: "Voice Assistant",
        voiceStatusText: "Click to start speaking",
        startVoiceText: "Start Voice Chat",
        toggleLangText: "हिंदी",
        
        // Accessibility
        accessibilityTitle: "Accessibility Options",
        audioGuideText: "Audio Guide",
        largeTextText: "Large Text",
        highContrastText: "High Contrast",
        
        // Sections
        featuredSchemesTitle: "Featured Schemes",
        
        // Hero Section
        checkEligibilityText: "Check Eligibility",
        viewAllSchemesText: "View All Schemes",
        overlayTitle: "Empowering Education",
        overlaySubtitle: "Quality education for all",
        educationCardText: "Education",
        healthCardText: "Health",
        housingCardText: "Housing",
        agricultureCardText: "Agriculture",
        benefitedLabel: "Citizens benefited",
        fundsLabel: "Funds disbursed",
        schemesLabel: "Active schemes",
        
        // Security
        secureText: "Secure",
        verifiedText: "Verified",
        
        // Contact
        whatsappText: "WhatsApp Support",
        smsText: "SMS Support",
        
        // Additional UI Elements
        walletConnectText: "Connect Wallet",
        walletConnectedText: "Wallet Connected",
        walletLoadingText: "Connecting...",
        blockchainFeaturesText: "Blockchain Features",
        digitalSecurityText: "Digital Security",
        transparentProcessText: "Transparent Process",
        
        // Scheme Categories
        educationSchemeText: "Education Schemes",
        healthSchemeText: "Health Schemes",
        housingSchemeText: "Housing Schemes",
        agricultureSchemeText: "Agriculture Schemes",
        womenEmpowermentText: "Women Empowerment",
        youthDevelopmentText: "Youth Development",
        
        // Status Messages
        eligibleText: "Eligible",
        notEligibleText: "Not Eligible",
        underReviewText: "Under Review",
        approvedText: "Approved",
        rejectedText: "Rejected",
        
        // Navigation
        homeText: "Home",
        schemesText: "Schemes",
        eligibilityText: "Eligibility",
        profileText: "Profile",
        helpText: "Help",
        aboutText: "About Us",
        
        // Forms
        submitText: "Submit",
        resetText: "Reset",
        saveText: "Save",
        cancelText: "Cancel",
        editText: "Edit",
        deleteText: "Delete",
        searchText: "Search",
        filterText: "Filter",
        
        // Notifications
        successMessage: "Successfully completed!",
        errorMessage: "An error occurred!",
        warningMessage: "Warning!",
        infoMessage: "Information",
        
        // Dates and Time
        todayText: "Today",
        yesterdayText: "Yesterday",
        lastWeekText: "Last Week",
        lastMonthText: "Last Month",
        
        // File Actions
        downloadText: "Download",
        uploadText: "Upload",
        viewText: "View",
        printText: "Print"
    },
    hi: {
        // Header
        langText: "English",
        voiceText: "आवाज सहायक",
        loginText: "लॉगिन",
        
        // Login Modal
        loginTitle: "खाता बनाएं",
        nameLabel: "पूरा नाम",
        ageLabel: "उम्र",
        emailLabel: "ईमेल",
        phoneLabel: "फोन नंबर",
        incomeLabel: "वार्षिक आय (₹)",
        genderLabel: "लिंग",
        categoryLabel: "श्रेणी",
        educationLabel: "शिक्षा स्तर",
        occupationLabel: "व्यवसाय",
        aadhaarLabel: "आधार नंबर",
        selectGender: "लिंग चुनें",
        maleOption: "पुरुष",
        femaleOption: "महिला",
        otherOption: "अन्य",
        selectCategory: "श्रेणी चुनें",
        generalOption: "सामान्य",
        obcOption: "ओबीसी",
        scOption: "एससी",
        stOption: "एसटी",
        selectEducation: "शिक्षा चुनें",
        illiterateOption: "अनपढ़",
        primaryOption: "प्राथमिक",
        secondaryOption: "माध्यमिक",
        higherSecondaryOption: "उच्च माध्यमिक",
        graduateOption: "स्नातक",
        postGraduateOption: "स्नातकोत्तर",
        selectOccupation: "व्यवसाय चुनें",
        farmerOption: "किसान",
        studentOption: "छात्र",
        unemployedOption: "बेरोजगार",
        employedOption: "नौकरीपेशा",
        businessOption: "व्यापार",
        otherOccupationOption: "अन्य",
        notificationTitle: "सूचना प्राथमिकताएं",
        emailPref: "ईमेल सूचनाएं",
        smsPref: "एसएमएस सूचनाएं",
        whatsappPref: "व्हाट्सऐप सूचनाएं",
        privacyText: "मैं योजना पात्रता सूचनाओं के लिए अपना डेटा स्टोर करने और चयनित तरीकों से संपर्क करने की अनुमति देता हूं।",
        createAccountText: "खाता बनाएं",
        
        // Notification Preferences
        notificationPrefsTitle: "सूचना प्राथमिकताएं",
        notificationPrefsDesc: "चुनें कि आप योजना पात्रता और लाभों के बारे में अपडेट कैसे प्राप्त करना चाहते हैं:",
        whatsappNotifTitle: "व्हाट्सऐप सूचनाएं",
        whatsappNotifDesc: "अपने व्हाट्सऐप पर तुरंत अपडेट पाएं",
        smsNotifTitle: "एसएमएस सूचनाएं",
        smsNotifDesc: "अपने मोबाइल पर टेक्स्ट संदेश प्राप्त करें",
        
        // DBT Modal
        dbtTitle: "डीबीटी खाता जागरूकता",
        dbtWhatTitle: "डीबीटी क्या है?",
        dbtDescription: "प्रत्यक्ष लाभ हस्तांतरण (डीबीटी) सुनिश्चित करता है कि सरकारी लाभ आधार से जुड़े आपके बैंक खाते में सीधे जमा हो जाएं।",
        checkAccountTitle: "अपने खाते की स्थिति जांचें",
        checkAccountDesc: "सरकारी लाभ प्राप्त करने के लिए जांचें कि क्या आपका बैंक खाता आधार से ठीक से जुड़ा है।",
        checkAccountBtnText: "मेरा खाता जांचें",
        
        // Voice Assistant
        voiceAssistantTitle: "आवाज सहायक",
        voiceStatusText: "बोलना शुरू करने के लिए क्लिक करें",
        startVoiceText: "आवाज चैट शुरू करें",
        toggleLangText: "English",
        
        // Accessibility
        accessibilityTitle: "पहुंच विकल्प",
        audioGuideText: "ऑडियो गाइड",
        largeTextText: "बड़ा टेक्स्ट",
        highContrastText: "उच्च कंट्रास्ट",
        
        // Sections
        featuredSchemesTitle: "विशेष योजनाएं",
        
        // Hero Section
        checkEligibilityText: "पात्रता जांचें",
        viewAllSchemesText: "सभी योजनाएं देखें",
        overlayTitle: "शिक्षा को सशक्त बनाना",
        overlaySubtitle: "सभी के लिए गुणवत्तापूर्ण शिक्षा",
        educationCardText: "शिक्षा",
        healthCardText: "स्वास्थ्य",
        housingCardText: "आवास",
        agricultureCardText: "कृषि",
        benefitedLabel: "लाभान्वित नागरिक",
        fundsLabel: "वितरित धनराशि",
        schemesLabel: "सक्रिय योजनाएं",
        
        // Security
        secureText: "सुरक्षित",
        verifiedText: "सत्यापित",
        
        // Contact
        whatsappText: "व्हाट्सऐप सहायता",
        smsText: "एसएमएस सहायता",
        
        // Additional UI Elements
        walletConnectText: "वॉलेट कनेक्ट करें",
        walletConnectedText: "वॉलेट जुड़ा हुआ",
        walletLoadingText: "कनेक्ट हो रहा है...",
        blockchainFeaturesText: "ब्लॉकचेन सुविधाएं",
        digitalSecurityText: "डिजिटल सुरक्षा",
        transparentProcessText: "पारदर्शी प्रक्रिया",
        
        // Scheme Categories
        educationSchemeText: "शिक्षा योजनाएं",
        healthSchemeText: "स्वास्थ्य योजनाएं",
        housingSchemeText: "आवास योजनाएं",
        agricultureSchemeText: "कृषि योजनाएं",
        womenEmpowermentText: "महिला सशक्तिकरण",
        youthDevelopmentText: "युवा विकास",
        
        // Status Messages
        eligibleText: "पात्र",
        notEligibleText: "अपात्र",
        underReviewText: "समीक्षाधीन",
        approvedText: "अनुमोदित",
        rejectedText: "अस्वीकृत",
        
        // Navigation
        homeText: "होम",
        schemesText: "योजनाएं",
        eligibilityText: "पात्रता",
        profileText: "प्रोफ़ाइल",
        helpText: "सहायता",
        aboutText: "हमारे बारे में",
        
        // Forms
        submitText: "सबमिट करें",
        resetText: "रीसेट करें",
        saveText: "सेव करें",
        cancelText: "रद्द करें",
        editText: "संपादित करें",
        deleteText: "हटाएं",
        searchText: "खोजें",
        filterText: "फ़िल्टर",
        
        // Notifications
        successMessage: "सफलतापूर्वक पूर्ण!",
        errorMessage: "त्रुटि हुई!",
        warningMessage: "चेतावनी!",
        infoMessage: "जानकारी",
        
        // Dates and Time
        todayText: "आज",
        yesterdayText: "कल",
        lastWeekText: "पिछला सप्ताह",
        lastMonthText: "पिछला महीना",
        
        // File Actions
        downloadText: "डाउनलोड करें",
        uploadText: "अपलोड करें",
        viewText: "देखें",
        printText: "प्रिंट करें"
    },
    ta: {
        // Header
        langText: "English",
        voiceText: "குரல் உதவியாளர்",
        loginText: "உள்நுழைவு",
        
        // Login Modal
        loginTitle: "கணக்கு உருவாக்க",
        nameLabel: "முழு பெயர்",
        ageLabel: "வயது",
        emailLabel: "மின்னஞ்சல்",
        phoneLabel: "தொலைபேசி எண்",
        incomeLabel: "வருடாந்திர வருமானம் (₹)",
        genderLabel: "பாலினம்",
        categoryLabel: "வகை",
        educationLabel: "கல்வி நிலை",
        occupationLabel: "தொழில்",
        aadhaarLabel: "ஆதார் எண்",
        selectGender: "பாலினம் தேர்வு செய்க",
        maleOption: "ஆண்",
        femaleOption: "பெண்",
        otherOption: "மற்றவை",
        selectCategory: "வகை தேர்வு செய்க",
        generalOption: "பொது",
        obcOption: "பி.சி.",
        scOption: "எஸ்.சி.",
        stOption: "எஸ்.டி.",
        selectEducation: "கல்வி தேர்வு செய்க",
        illiterateOption: "கல்வியறிவு இல்லாத",
        primaryOption: "ஆரம்ப",
        secondaryOption: "இடைநிலை",
        higherSecondaryOption: "உயர் இடைநிலை",
        graduateOption: "பட்டதாரி",
        postGraduateOption: "முதுகலை",
        selectOccupation: "தொழில் தேர்வு செய்க",
        farmerOption: "விவசாயி",
        studentOption: "மாணவர்",
        unemployedOption: "வேலையில்லாத",
        employedOption: "வேலையில் உள்ளவர்",
        businessOption: "வணிகம்",
        otherOccupationOption: "மற்றவை",
        notificationTitle: "அறிவிப்பு விருப்பங்கள்",
        emailPref: "மின்னஞ்சல் அறிவிப்புகள்",
        smsPref: "குறுந்தகவல் அறிவிப்புகள்",
        whatsappPref: "வாட்ஸ்அப் அறிவிப்புகள்",
        privacyText: "திட்ட தகுதி அறிவிப்புகளுக்கு எனது தரவை சேமிக்க ஒப்புக்கொள்கிறேன் மற்றும் தேர்ந்தெடுக்கப்பட்ட முறைகள் மூலம் என்னை தொடர்பு கொள்ள அனுமதி அளிக்கிறேன்.",
        createAccountText: "கணக்கு உருவாக்க",
        
        // Notification Preferences
        notificationPrefsTitle: "அறிவிப்பு விருப்பங்கள்",
        notificationPrefsDesc: "திட்ட தகுதி மற்றும் பலன்கள் பற்றிய புதுப்பிப்புகளை எவ்வாறு பெற விரும்புகிறீர்கள் என்பதைத் தேர்வு செய்யுங்கள்:",
        whatsappNotifTitle: "வாட்ஸ்அப் அறிவிப்புகள்",
        whatsappNotifDesc: "உங்கள் வாட்ஸ்அப்பில் உடனடி புதுப்பிப்புகளைப் பெறுங்கள்",
        smsNotifTitle: "குறுந்தகவல் அறிவிப்புகள்",
        smsNotifDesc: "உங்கள் மொபைலில் குறுந்தகவல்களைப் பெறுங்கள்",
        
        // DBT Modal
        dbtTitle: "டி.பி.டி கணக்கு விழிப்புணர்வு",
        dbtWhatTitle: "டி.பி.டி என்றால் என்ன?",
        dbtDescription: "நேரடி பலன் மாற்றம் (டி.பி.டி) ஆதாருடன் இணைக்கப்பட்ட உங்கள் வங்கி கணக்கில் அரசாங்க பலன்கள் நேரடியாக வரவு வைக்கப்படுவதை உறுதி செய்கிறது.",
        checkAccountTitle: "உங்கள் கணக்கு நிலையைச் சரிபார்க்கவும்",
        checkAccountDesc: "அரசாங்க பலன்களைப் பெறுவதற்கு உங்கள் வங்கி கணக்கு ஆதாருடன் சரியாக இணைக்கப்பட்டுள்ளதா என்பதைச் சரிபார்க்கவும்.",
        checkAccountBtnText: "என் கணக்கைச் சரிபார்க்கவும்",
        
        // Voice Assistant
        voiceAssistantTitle: "குரல் உதவியாளர்",
        voiceStatusText: "பேசத் தொடங்க கிளிக் செய்யவும்",
        startVoiceText: "குரல் அரட்டையைத் தொடங்கவும்",
        toggleLangText: "हिंदी",
        
        // Accessibility
        accessibilityTitle: "அணுகல் விருப்பங்கள்",
        audioGuideText: "ஆடியோ வழிகாட்டி",
        largeTextText: "பெரிய உரை",
        highContrastText: "உயர் மாறுபாடு",
        
        // Sections
        featuredSchemesTitle: "சிறப்பு திட்டங்கள்",
        
        // Hero Section
        checkEligibilityText: "தகுதியைச் சரிபார்க்கவும்",
        viewAllSchemesText: "அனைத்து திட்டங்களையும் பார்க்கவும்",
        overlayTitle: "கல்வியை வலுப்படுத்துதல்",
        overlaySubtitle: "அனைவருக்கும் தரமான கல்வி",
        educationCardText: "கல்வி",
        healthCardText: "சுகாதாரம்",
        housingCardText: "வீட்டுவசதி",
        agricultureCardText: "விவசாயம்",
        benefitedLabel: "பயனடைந்த குடிமக்கள்",
        fundsLabel: "வழங்கப்பட்ட நிதி",
        schemesLabel: "செயலில் உள்ள திட்டங்கள்",
        
        // Security
        secureText: "பாதுகாப்பான",
        verifiedText: "சரிபார்க்கப்பட்ட",
        
        // Contact
        whatsappText: "வாட்ஸ்அப் ஆதரவு",
        smsText: "குறுந்தகவல் ஆதரவு",
        
        // Additional UI Elements
        walletConnectText: "வாலட்டை இணைக்கவும்",
        walletConnectedText: "வாலட் இணைக்கப்பட்டது",
        walletLoadingText: "இணைக்கிறது...",
        blockchainFeaturesText: "பிளாக்செயின் அம்சங்கள்",
        digitalSecurityText: "டிஜிட்டல் பாதுகாப்பு",
        transparentProcessText: "வெளிப்படையான செயல்முறை",
        
        // Scheme Categories
        educationSchemeText: "கல்வி திட்டங்கள்",
        healthSchemeText: "சுகாதார திட்டங்கள்",
        housingSchemeText: "வீட்டுவசதி திட்டங்கள்",
        agricultureSchemeText: "விவசாய திட்டங்கள்",
        womenEmpowermentText: "பெண்கள் அதிகாரமளித்தல்",
        youthDevelopmentText: "இளைஞர் மேம்பாடு",
        
        // Status Messages
        eligibleText: "தகுதியுள்ள",
        notEligibleText: "தகுதியற்ற",
        underReviewText: "மதிப்பாய்வில்",
        approvedText: "அங்கீகரிக்கப்பட்டது",
        rejectedText: "நிராகரிக்கப்பட்டது",
        
        // Navigation
        homeText: "முகப்பு",
        schemesText: "திட்டங்கள்",
        eligibilityText: "தகுதி",
        profileText: "சுயவிவரம்",
        helpText: "உதவி",
        aboutText: "எங்களைப் பற்றி",
        
        // Forms
        submitText: "சமர்ப்பிக்கவும்",
        resetText: "மீட்டமைக்கவும்",
        saveText: "சேமிக்கவும்",
        cancelText: "ரத்துசெய்",
        editText: "திருத்து",
        deleteText: "நீக்கு",
        searchText: "தேடு",
        filterText: "வடிகட்டு",
        
        // Notifications
        successMessage: "வெற்றிகரமாக முடிந்தது!",
        errorMessage: "பிழை ஏற்பட்டது!",
        warningMessage: "எச்சரிக்கை!",
        infoMessage: "தகவல்",
        
        // Dates and Time
        todayText: "இன்று",
        yesterdayText: "நேற்று",
        lastWeekText: "கடந்த வாரம்",
        lastMonthText: "கடந்த மாதம்",
        
        // File Actions
        downloadText: "பதிவிறக்கு",
        uploadText: "பதிவேற்று",
        viewText: "பார்க்கவும்",
        printText: "அச்சிடு"
    }
};

// Current language
let currentLanguage = 'en';
let currentVoiceLanguage = 'en-US';

// Language toggle function with three languages
function toggleLanguage() {
    const body = document.body;
    const langText = document.getElementById('langText');
    
    // Cycle through three languages: English -> Hindi -> Tamil -> English
    if (currentLanguage === 'en') {
        currentLanguage = 'hi';
        currentVoiceLanguage = 'hi-IN';
        body.classList.add('hindi');
        body.classList.remove('tamil');
        updateLanguage('hi');
    } else if (currentLanguage === 'hi') {
        currentLanguage = 'ta';
        currentVoiceLanguage = 'ta-IN';
        body.classList.remove('hindi');
        body.classList.add('tamil');
        updateLanguage('ta');
    } else {
        currentLanguage = 'en';
        currentVoiceLanguage = 'en-US';
        body.classList.remove('hindi');
        body.classList.remove('tamil');
        updateLanguage('en');
    }
}

// SMS Support functionality
function initSMSSupport() {
    const smsSupportBtn = document.getElementById('smsSupportBtn');
    if (smsSupportBtn) {
        smsSupportBtn.addEventListener('click', function() {
            // Open SMS app with pre-filled message
            const phoneNumber = '1800-11-0001'; // Government helpline
            const message = encodeURIComponent('Hello, I need help with government schemes on Nidhisetu portal.');
            const smsUrl = `sms:${phoneNumber}?body=${message}`;
            
            // For mobile devices
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                window.location.href = smsUrl;
            } else {
                // For desktop - show phone number
                alert(`Please send SMS to: ${phoneNumber}\nMessage: "Hello, I need help with government schemes on Nidhisetu portal."`);
            }
        });
    }
}

// DOM Elements
const dbtModal = document.getElementById('dbtModal');
const voiceModal = document.getElementById('voiceModal');
const loginModal = document.getElementById('loginModal');
const schemesGrid = document.getElementById('schemesGrid');
const eligibilitySection = document.getElementById('eligibilitySection');
const eligibilityResults = document.getElementById('eligibilityResults');
const chatMessages = document.getElementById('chatMessages');
const accessibilityPanel = document.getElementById('accessibilityPanel');
const accessibilityMenu = document.getElementById('accessibilityMenu');
// Notifications UI
const notificationsBtn = document.getElementById('notificationsBtn');
const notificationsDropdown = document.getElementById('notificationsDropdown');
const notificationsList = document.getElementById('notificationsList');
const notificationsEmpty = document.getElementById('notificationsEmpty');
const notifBadge = document.getElementById('notifBadge');
const clearNotificationsBtn = document.getElementById('clearNotifications');

// User data storage
let userData = JSON.parse(localStorage.getItem('userData')) || null;
let notificationPreferences = JSON.parse(localStorage.getItem('notificationPreferences')) || {
    email: true,
    sms: true,
    whatsapp: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    populateSchemes();
    updateLanguage(); // Initialize language
    requestNotificationPermission(); // Request notification permission
    
    // Show DBT modal after page loads (with delay)
    setTimeout(() => {
        if (!localStorage.getItem('dbtModalShown')) {
            showDbtModal();
            localStorage.setItem('dbtModalShown', 'true');
        }
    }, 3000); // Show after 3 seconds
    
    // Check if user is logged in
    if (userData) {
        document.getElementById('loginBtn').innerHTML = '<i class="fas fa-user"></i> <span id="loginText">Profile</span>';
        checkEligibilityForUser();
    }
    // Stats counters & notifications
    startCounters();
    updateNotifBadge();
    
    // Add animation classes
    addScrollAnimations();
});

// Initialize application
function initializeApp() {
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.category-card, .scheme-card');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('fade-in');
    });
}

// Setup event listeners
function setupEventListeners() {
    // Language Toggle
    document.getElementById('languageToggle').addEventListener('click', toggleLanguage);
    
    // Login Modal
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('closeLoginModal').addEventListener('click', hideLoginModal);
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    
    // DBT Modal
    document.getElementById('closeDbtModal').addEventListener('click', hideDbtModal);
    document.getElementById('checkAccountBtn').addEventListener('click', () => {
        window.open('https://uidai.gov.in', '_blank');
    });
    
    // Voice Modal
    document.getElementById('voiceChatBtn').addEventListener('click', showVoiceModal);
    document.getElementById('closeVoiceModal').addEventListener('click', hideVoiceModal);
    document.getElementById('startVoiceBtn').addEventListener('click', startVoiceChat);
    document.getElementById('toggleLanguageBtn').addEventListener('click', toggleVoiceLanguage);
    
    // Enhanced Blockchain Wallet Connection
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async (e) => {
            // Prevent multiple clicks during connection
            if (connectWalletBtn.classList.contains('loading')) {
                return;
            }
            
            try {
                if (window.blockchain && window.ethereum) {
                    await window.blockchain.connectWallet();
                } else if (!window.ethereum) {
                    // Demo mode: simulate wallet connection without MetaMask
                    const demoAddress = '0xDemo...A1B2';
                    connectWalletBtn.classList.add('connected');
                    connectWalletBtn.querySelector('.btn-text').textContent = 'Demo Wallet ✓';
                    if (window.updateWalletStatus) {
                        window.updateWalletStatus(true, '0xDemoAddress1234A1B2');
                    }
                    showNotification('✅ Demo wallet connected! You can now fill in your login details.', 'success');
                } else {
                    console.error('Blockchain integration not loaded');
                    showNotification('Wallet connect unavailable. You can still login without a wallet.', 'info');
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
                let message = 'Failed to connect wallet. Please try again.';
                if (error.code === 4001) {
                    message = 'Connection cancelled by user';
                }
                
                const notification = document.createElement('div');
                notification.className = 'notification notification-error';
                notification.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-icon"><i class="fas fa-times-circle"></i></div>
                        <div class="notification-text">${message}</div>
                    </div>
                `;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 5000);
            }
        });
    }
    
    // Accessibility Panel
    document.getElementById('accessibilityToggle').addEventListener('click', toggleAccessibilityMenu);
    document.getElementById('audioGuide').addEventListener('change', toggleAudioGuide);
    document.getElementById('largeText').addEventListener('change', toggleLargeText);
    document.getElementById('highContrast').addEventListener('change', toggleHighContrast);
    
    // Eligibility Checker
    document.getElementById('checkEligibilityBtn').addEventListener('click', () => {
        eligibilitySection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Note: checkEligibilityFormBtn event listener is handled in initEligibilityChecker()
    
    // Category Cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterSchemesByCategory(category);
        });
    });
    
    // View All Schemes
    document.getElementById('viewAllSchemesBtn').addEventListener('click', showAllSchemes);
    
    // Notifications
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('show');
            renderNotifications();
        });
    }
    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.setItem('notifications', JSON.stringify([]));
            renderNotifications();
            updateNotifBadge();
        });
    }
    document.addEventListener('click', () => notificationsDropdown.classList.remove('show'));
    notificationsDropdown.addEventListener('click', (e) => e.stopPropagation());
    
    // SMS Support
    document.getElementById('smsSupportBtn').addEventListener('click', () => {
        const message = currentLanguage === 'hi' 
            ? 'नमस्ते! मुझे MyScheme Portal के बारे में जानकारी चाहिए।'
            : 'Hello! I need information about MyScheme Portal.';
        const smsUrl = `sms:8118825200?body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
    });

    // Close accessibility menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!accessibilityPanel.contains(e.target)) {
            accessibilityMenu.classList.remove('show');
        }
    });
}

// Language Toggle Functions
function toggleLanguageMenu() {
    const languageMenu = document.getElementById('languageMenu');
    languageMenu.classList.toggle('show');
}

function hideLanguageMenu() {
    const languageMenu = document.getElementById('languageMenu');
    languageMenu.classList.remove('show');
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    updateLanguageButton();
}

function updateLanguageButton() {
    const langText = document.getElementById('langText');
    const langMap = {
        'en': 'English',
        'hi': 'हिंदी', 
        'ta': 'தமிழ்'
    };
    if (langText) {
        langText.textContent = langMap[currentLanguage] || 'English';
    }
}

function toggleLanguage() {
    // Cycle through languages: English → Hindi → Tamil → English
    switch(currentLanguage) {
        case 'en':
            currentLanguage = 'hi';
            break;
        case 'hi':
            currentLanguage = 'ta';
            break;
        case 'ta':
            currentLanguage = 'en';
            break;
        default:
            currentLanguage = 'en';
    }
    
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    updateLanguageButton();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[id]');
    elements.forEach(element => {
        const id = element.id;
        if (translations[currentLanguage] && translations[currentLanguage][id]) {
            element.textContent = translations[currentLanguage][id];
        }
    });
    
    // Update body classes for fonts
    document.body.classList.toggle('hindi', currentLanguage === 'hi');
    document.body.classList.toggle('tamil', currentLanguage === 'ta');
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    console.log('Language updated to:', currentLanguage);
}

// Login Modal Functions
function showLoginModal() {
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Demo data auto-fill function
function fillDemoLoginData() {
    document.getElementById('fullName').value = 'Rahul Sharma';
    document.getElementById('loginAge').value = '28';
    document.getElementById('loginEmail').value = 'rahul.sharma@example.com';
    document.getElementById('loginPhone').value = '9876543210';
    document.getElementById('loginIncome').value = '120000';
    document.getElementById('loginAadhaar').value = '234567890123';
    document.getElementById('loginGender').value = 'male';
    document.getElementById('loginCategory').value = 'obc';
    document.getElementById('loginEducation').value = 'graduate';
    document.getElementById('loginOccupation').value = 'employed';
    document.getElementById('emailNotifications').checked = true;
    document.getElementById('whatsappNotifications').checked = true;
    document.getElementById('smsNotifications').checked = false;
    document.getElementById('privacyConsent').checked = true;

    // Visual feedback on auto-fill button
    const btn = document.getElementById('fillDemoDataBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Filled!';
        btn.style.background = '#4CAF50';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-bolt"></i> Auto-Fill';
            btn.style.background = 'white';
            btn.style.color = '#764ba2';
        }, 2000);
    }
}


function handleLoginSubmit(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        age: parseInt(document.getElementById('loginAge').value),
        email: document.getElementById('loginEmail').value,
        phone: document.getElementById('loginPhone').value,
        income: parseInt(document.getElementById('loginIncome').value),
        gender: document.getElementById('loginGender').value,
        category: document.getElementById('loginCategory').value,
        education: document.getElementById('loginEducation').value,
        occupation: document.getElementById('loginOccupation').value,
        aadhaar: document.getElementById('loginAadhaar').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        whatsappNotifications: document.getElementById('whatsappNotifications').checked,
        privacyConsent: document.getElementById('privacyConsent').checked
    };
    
    if (!formData.privacyConsent) {
        alert('Please agree to the privacy policy to continue.');
        return;
    }
    
    // Store user data
    userData = formData;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Store notification preferences
    notificationPreferences = {
        email: formData.emailNotifications,
        sms: formData.smsNotifications,
        whatsapp: formData.whatsappNotifications
    };
    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
    
    // Show success message
    const name = formData.fullName.split(' ')[0];
    showNotification(`🎉 Welcome, ${name}! Account created successfully. Checking your scheme eligibility...`, 'success');
    
    // Update Login button to show logged-in state
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user-check"></i> <span id="loginText">${name}</span>`;
        loginBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    }
    
    // Hide modal
    hideLoginModal();
    
    // Check eligibility immediately
    setTimeout(() => {
        checkEligibilityForUser();
    }, 1000);
}

// Accessibility Functions
function toggleAccessibilityMenu() {
    accessibilityMenu.classList.toggle('show');
}

function toggleAudioGuide() {
    const audioGuide = document.getElementById('audioGuide').checked;
    if (audioGuide) {
        // Enable text-to-speech for important elements
        enableAudioGuide();
    } else {
        disableAudioGuide();
    }
}

function toggleLargeText() {
    const largeText = document.getElementById('largeText').checked;
    document.body.classList.toggle('large-text', largeText);
}

function toggleHighContrast() {
    const highContrast = document.getElementById('highContrast').checked;
    document.body.classList.toggle('high-contrast', highContrast);
}

function enableAudioGuide() {
    // Add click listeners to important elements for audio feedback
    const importantElements = document.querySelectorAll('.scheme-card, .category-card, .btn');
    importantElements.forEach(element => {
        element.addEventListener('click', () => {
            const text = element.textContent || element.innerText;
            if (text && text.length < 50) {
                speakText(text);
            }
        });
    });
}

function disableAudioGuide() {
    // Remove audio guide functionality
    console.log('Audio guide disabled');
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

// Voice Language Toggle
function toggleVoiceLanguage() {
    currentVoiceLanguage = currentVoiceLanguage === 'en-US' ? 'hi-IN' : 'en-US';
    const button = document.getElementById('toggleLanguageBtn');
    button.querySelector('span').textContent = currentVoiceLanguage === 'en-US' ? 'हिंदी' : 'English';
}

// DBT Modal functions (using standard modal system)
function showDbtModal() {
    showModal('dbtModal');
}

function hideDbtModal() {
    hideModal('dbtModal');
}

function closeDbtModal() {
    hideModal('dbtModal');
}

// Check Account Status
function checkAccountStatus() {
    const button = document.getElementById('checkAccountBtn');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<div class="loading"></div> Checking...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check-circle"></i> Account Verified!';
        button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.background = '';
            hideDbtModal();
        }, 2000);
    }, 2000);
}

// Show Voice Modal
function showVoiceModal() {
    voiceModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide Voice Modal
function hideVoiceModal() {
    voiceModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// AI Prototype toggle
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'aiModeToggle') {
        aiPrototypeEnabled = e.target.checked;
        addChatMessage('bot', aiPrototypeEnabled ? (currentLanguage === 'hi' ? 'एआई प्रोटोटाइप मोड चालू' : 'AI Prototype mode ON') : (currentLanguage === 'hi' ? 'एआई प्रोटोटाइप मोड बंद' : 'AI Prototype mode OFF'));
    }
});

let aiPrototypeEnabled = false;
async function askPrototypeAI(text) {
    const t = text.toLowerCase();
    if (t.includes('eligibility') || t.includes('पात्रता')) return ruleBasedReply('eligibility');
    if (t.includes('dbt') || t.includes('डीबीटी')) return ruleBasedReply('dbt');
    if (t.includes('scheme') || t.includes('योजना')) return ruleBasedReply('schemes');
    if (t.includes('farmer') || t.includes('किसान')) return ruleBasedReply('agriculture');
    if (t.includes('student') || t.includes('छात्र')) return ruleBasedReply('education');
    return ruleBasedReply('default');
}

function ruleBasedReply(intent) {
    const hi = currentLanguage === 'hi';
    const map = {
        eligibility: hi ? 'मैं आपकी पात्रता जांचने में मदद कर सकता हूं। कृपया नीचे फॉर्म भरें।' : 'I can help check your eligibility. Please fill the form below.',
        dbt: hi ? 'मैं DBT खाता जांच खोल रहा हूँ।' : 'Opening DBT account check.',
        schemes: hi ? 'यहां उपलब्ध योजनाएं हैं।' : 'Here are the available schemes.',
        agriculture: hi ? 'कृषि योजनाएं दिखा रहा हूँ।' : 'Showing agriculture schemes.',
        education: hi ? 'शिक्षा योजनाएं दिखा रहा हूँ।' : 'Showing education schemes.',
        default: hi ? 'मैं आपकी कैसे मदद कर सकता हूँ?' : 'How can I help you?'
    };
    return map[intent] || map.default;
}

// Start Voice Chat
function startVoiceChat() {
    const button = document.getElementById('startVoiceBtn');
    const status = document.querySelector('.voice-status');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        addChatMessage('bot', 'Sorry, your browser does not support voice recognition. Please use a modern browser like Chrome or Edge.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentVoiceLanguage;
    
    button.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
    status.textContent = currentLanguage === 'hi' ? 'सुन रहा हूं... बोलिए' : 'Listening... Speak now';
    
    recognition.onstart = function() {
        console.log('Voice recognition started');
    };
    
    recognition.onresult = async function(event) {
        const transcript = event.results[0][0].transcript;
        addChatMessage('user', transcript);
        if (aiPrototypeEnabled) {
            const reply = await askPrototypeAI(transcript);
            addChatMessage('bot', reply);
            if (reply.toLowerCase().includes('dbt')) setTimeout(showDbtModal, 600);
            if (reply.toLowerCase().includes('scheme') || reply.includes('योजना')) showAllSchemes();
        } else {
            processVoiceCommand(transcript);
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
        status.textContent = currentLanguage === 'hi' ? 'त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Error occurred. Please try again.';
        button.innerHTML = '<i class="fas fa-play"></i> Start Voice Chat';
    };
    
    recognition.onend = function() {
        button.innerHTML = '<i class="fas fa-play"></i> Start Voice Chat';
        status.textContent = currentLanguage === 'hi' ? 'बोलना शुरू करने के लिए क्लिक करें' : 'Click to start speaking';
    };
    
    recognition.start();
}

// Process Voice Commands
function processVoiceCommand(transcript) {
    const command = transcript.toLowerCase();
    
    if (command.includes('eligibility') || command.includes('check eligibility')) {
        addChatMessage('bot', 'I can help you check your eligibility for government schemes. Please fill out the eligibility form below or tell me your age, income, and occupation.');
        setTimeout(() => {
            eligibilitySection.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    } else if (command.includes('schemes') || command.includes('show schemes')) {
        addChatMessage('bot', 'Here are the available government schemes. You can click on any scheme to learn more about it.');
        showAllSchemes();
    } else if (command.includes('dbt') || command.includes('account')) {
        addChatMessage('bot', 'I can help you check your DBT account status. Let me open the DBT account verification for you.');
        setTimeout(() => {
            showDbtModal();
        }, 1000);
    } else if (command.includes('agriculture') || command.includes('farmer')) {
        addChatMessage('bot', 'You might be interested in PM Kisan Yojana. This scheme provides direct income support to farmers.');
        filterSchemesByCategory('agriculture');
    } else if (command.includes('education') || command.includes('student')) {
        addChatMessage('bot', 'For students, there\'s the PM Scholarship scheme available for higher education.');
        filterSchemesByCategory('education');
    } else if (command.includes('pension') || command.includes('old age')) {
        addChatMessage('bot', 'The Old Age Pension Scheme is available for citizens above 60 years of age.');
        filterSchemesByCategory('social-welfare');
    } else if (command.includes('women') || command.includes('lpg')) {
        addChatMessage('bot', 'PM Ujjwala Yojana provides free LPG connections to women from BPL families.');
        filterSchemesByCategory('women-welfare');
    } else {
        addChatMessage('bot', 'I understand you said: "' + transcript + '". How can I help you with government schemes? You can ask about eligibility, specific schemes, or DBT account verification.');
    }
}

// Add Chat Message
function addChatMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Populate Schemes
function populateSchemes() {
    schemesGrid.innerHTML = '';
    
    schemes.forEach(scheme => {
        const schemeCard = createSchemeCard(scheme);
        schemesGrid.appendChild(schemeCard);
    });
}

// Create Scheme Card
function createSchemeCard(scheme) {
    const card = document.createElement('div');
    card.className = 'scheme-card';
    card.innerHTML = `
        <img src="${scheme.image}" alt="${scheme.title}" class="scheme-image" onerror="this.src='https://via.placeholder.com/400x200/ff6b35/ffffff?text=${encodeURIComponent(scheme.title)}'">
        <div class="scheme-content">
            <div class="scheme-header">
                <div>
                    <h3 class="scheme-title">${scheme.title}</h3>
                    <span class="scheme-category">${scheme.category.replace('-', ' ').toUpperCase()}</span>
                </div>
                <i class="${scheme.icon}" style="color: ${scheme.color}; font-size: 2rem;"></i>
            </div>
            <p class="scheme-description">${scheme.description}</p>
            
            <div class="video-section">
                <h4><i class="fas fa-play-circle"></i> Watch Video Guide</h4>
                <p>Learn about this scheme in simple language</p>
                <a href="https://www.youtube.com/watch?v=${scheme.videoId}" target="_blank" rel="noopener noreferrer" class="video-thumbnail-link" style="display:block;position:relative;border-radius:8px;overflow:hidden;cursor:pointer;text-decoration:none;">
                    <img src="https://img.youtube.com/vi/${scheme.videoId}/hqdefault.jpg" alt="${scheme.videoTitle}" style="width:100%;display:block;border-radius:8px;" onerror="this.src='https://img.youtube.com/vi/${scheme.videoId}/mqdefault.jpg'">
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;background:rgba(255,0,0,0.85);border-radius:50%;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-play" style="color:white;font-size:22px;margin-left:4px;"></i>
                    </div>
                </a>
            </div>
            
            <div class="eligibility-criteria">
                <h4><i class="fas fa-check-circle"></i> Eligibility Criteria:</h4>
                <ul>
                    ${scheme.eligibility.map(criteria => `<li>${criteria}</li>`).join('')}
                </ul>
            </div>
            
            <div class="scheme-actions">
                <button class="btn btn-primary" onclick="applyForScheme(${scheme.id})">
                    <i class="fas fa-arrow-right"></i> Apply Now
                </button>
                <button class="btn btn-secondary" onclick="visitOfficialWebsite('${scheme.officialLink}')">
                    <i class="fas fa-external-link-alt"></i> Official Website
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Apply for Scheme
function applyForScheme(schemeId) {
    const scheme = schemes.find(s => s.id === schemeId);
    if (scheme) {
        alert(`Redirecting to ${scheme.title} application page...`);
        // In a real application, this would redirect to the actual application form
        visitOfficialWebsite(scheme.officialLink);
    }
}

// Visit Official Website
function visitOfficialWebsite(url) {
    window.open(url, '_blank');
}

// Notifications rendering
function renderNotifications() {
    const items = JSON.parse(localStorage.getItem('notifications')) || [];
    notificationsList.innerHTML = '';
    if (items.length === 0) {
        notificationsEmpty.style.display = 'block';
        return;
    }
    notificationsEmpty.style.display = 'none';
    items.slice(-20).reverse().forEach(n => {
        const div = document.createElement('div');
        div.className = 'notifications-item';
        const date = new Date(n.timestamp).toLocaleString();
        div.textContent = `${n.message} • ${date}`;
        notificationsList.appendChild(div);
    });
}

function updateNotifBadge() {
    const items = JSON.parse(localStorage.getItem('notifications')) || [];
    if (!notifBadge) return;
    if (items.length === 0) {
        notifBadge.style.display = 'none';
    } else {
        notifBadge.style.display = 'inline-block';
        notifBadge.textContent = Math.min(items.length, 9) + (items.length > 9 ? '+' : '');
    }
}

// Animated counters for statistics
function startCounters() {
    const targets = {
        benefitedCount: 900000000, // 900 million
        fundsCount: 50000000000000, // ₹5 lakh crore
        schemesCount: 4000 // 4000+ schemes
    };
    
    const elements = {
        benefitedCount: document.getElementById('benefitedCount'),
        fundsCount: document.getElementById('fundsCount'),
        schemesCount: document.getElementById('schemesCount')
    };
    
    Object.keys(targets).forEach(key => {
        if (elements[key]) {
            animateCounter(elements[key], targets[key], key);
        }
    });
}

function animateCounter(element, target, type) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (type === 'benefitedCount') {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        } else if (type === 'fundsCount') {
            element.textContent = '₹' + Math.floor(current / 100000000000).toLocaleString() + 'L Cr+';
        } else if (type === 'schemesCount') {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        }
    }, 20);
}

// Scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                if (entry.target.classList.contains('stat')) {
                    entry.target.style.animationDelay = Math.random() * 0.5 + 's';
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.scheme-card, .category-card, .stat, .hero-text, .hero-image').forEach(el => {
        observer.observe(el);
    });
}

// Filter Schemes by Category
function filterSchemesByCategory(category) {
    const filteredSchemes = schemes.filter(scheme => scheme.category === category);
    
    schemesGrid.innerHTML = '';
    filteredSchemes.forEach(scheme => {
        const schemeCard = createSchemeCard(scheme);
        schemesGrid.appendChild(schemeCard);
    });
    
    // Scroll to schemes section
    document.querySelector('.featured-schemes').scrollIntoView({ behavior: 'smooth' });
}

// Show All Schemes
function showAllSchemes() {
    populateSchemes();
    document.querySelector('.featured-schemes').scrollIntoView({ behavior: 'smooth' });
}

// Check Eligibility
async function checkEligibility() {
    const age = parseInt(document.getElementById('age').value);
    const income = parseInt(document.getElementById('income').value);
    const gender = document.getElementById('gender').value;
    const category = document.getElementById('category').value;
    const education = document.getElementById('education').value;
    const occupation = document.getElementById('occupation').value;
    
    if (!age || !income || !gender || !category || !education || !occupation) {
        alert('Please fill in all fields to check eligibility.');
        return;
    }
    
    // Try MongoDB eligibility check first (enhanced algorithm)
    let mongoEligibleSchemes = [];
    if (window.mongoService.isConnected) {
        try {
            mongoEligibleSchemes = await window.mongoService.getEligibleSchemes({
                age, income, gender, category, education, occupation,
                state: 'Demo State' // You can add state field to form if needed
            });
            
            if (mongoEligibleSchemes.length > 0) {
                console.log(`✅ Found ${mongoEligibleSchemes.length} eligible schemes from MongoDB`);
                showMongoEligibilityResults(mongoEligibleSchemes);
                return;
            }
        } catch (error) {
            console.log('MongoDB eligibility check failed, using local algorithm');
        }
    }
    
    // Fallback to local eligibility check
    const eligibleSchemes = [];
    
    schemes.forEach(scheme => {
        let isEligible = false;
        let reason = '';
        
        switch(scheme.id) {
            case 1: // PM Kisan
                if (occupation === 'farmer' && income < 200000) {
                    isEligible = true;
                    reason = 'You are eligible as a farmer with income below ₹2 lakhs';
                } else if (occupation !== 'farmer') {
                    reason = 'This scheme is only for farmers';
                } else {
                    reason = 'Income criteria not met';
                }
                break;
                
            case 2: // PM Scholarship
                if (age >= 18 && education === 'graduate' && income < 600000) {
                    isEligible = true;
                    reason = 'You meet all criteria for the scholarship';
                } else if (age < 18) {
                    reason = 'You must be 18 or older';
                } else if (education !== 'graduate') {
                    reason = 'You must be a graduate student';
                } else {
                    reason = 'Income criteria not met (must be below ₹6 lakhs)';
                }
                break;
                
            case 3: // Old Age Pension
                if (age >= 60 && income < 100000) {
                    isEligible = true;
                    reason = 'You are eligible for old age pension';
                } else if (age < 60) {
                    reason = 'You must be 60 or older';
                } else {
                    reason = 'Income criteria not met (must be below ₹1 lakh)';
                }
                break;
                
            case 4: // PM Ujjwala
                if (gender === 'female' && income < 100000) {
                    isEligible = true;
                    reason = 'You are eligible for PM Ujjwala Yojana';
                } else if (gender !== 'female') {
                    reason = 'This scheme is only for women';
                } else {
                    reason = 'Income criteria not met (BPL status required)';
                }
                break;
        }
        
        if (isEligible) {
            eligibleSchemes.push({ scheme, reason });
        }
    });
    
    displayEligibilityResults(eligibleSchemes);
}

// Display Eligibility Results
function displayEligibilityResults(eligibleSchemes) {
    eligibilityResults.innerHTML = '';
    
    if (eligibleSchemes.length === 0) {
        eligibilityResults.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #ff6b35; margin-bottom: 1rem;"></i>
                <h3>No Eligible Schemes Found</h3>
                <p>Based on your information, you are not currently eligible for any of the featured schemes. Please check back later or explore other government schemes.</p>
            </div>
        `;
    } else {
        eligibilityResults.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #333;">
                <i class="fas fa-check-circle" style="color: #4CAF50;"></i> 
                You are eligible for ${eligibleSchemes.length} scheme(s)
            </h3>
            <div class="eligible-schemes">
                ${eligibleSchemes.map(item => `
                    <div class="eligible-scheme">
                        <div class="eligible-scheme-info">
                            <h4>${item.scheme.title}</h4>
                            <p>${item.reason}</p>
                        </div>
                        <button class="btn btn-primary" onclick="applyForScheme(${item.scheme.id})">
                            Apply Now
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    eligibilityResults.classList.add('show');
    eligibilityResults.scrollIntoView({ behavior: 'smooth' });
}

// Notification System
function sendNotification(message, type = 'info') {
    if (!userData) return;
    
    const notification = {
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        userId: userData.email
    };
    
    // Store notification
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Send via selected methods
    if (notificationPreferences.email) {
        sendEmailNotification(message, userData.email);
    }
    
    if (notificationPreferences.sms) {
        sendSMSNotification(message, userData.phone);
    }
    
    if (notificationPreferences.whatsapp) {
        sendWhatsAppNotification(message, userData.phone);
    }
    
    // Show browser notification
    showBrowserNotification(message);
}

function sendEmailNotification(message, email) {
    // Simulate email sending
    console.log(`Email sent to ${email}: ${message}`);
    // In a real application, this would integrate with an email service
}

function sendSMSNotification(message, phone) {
    // Simulate SMS sending
    console.log(`SMS sent to ${phone}: ${message}`);
    // In a real application, this would integrate with an SMS service
}

function sendWhatsAppNotification(message, phone) {
    // Simulate WhatsApp sending
    console.log(`WhatsApp sent to ${phone}: ${message}`);
    // In a real application, this would integrate with WhatsApp Business API
}

function showBrowserNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('MyScheme Portal', {
            body: message,
            icon: '/favicon.ico'
        });
    }
    updateNotifBadge();
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Check eligibility for logged-in user
function checkEligibilityForUser() {
    if (!userData) return;
    
    const eligibleSchemes = [];
    
    schemes.forEach(scheme => {
        let isEligible = false;
        let reason = '';
        
        switch(scheme.id) {
            case 1: // PM Kisan
                if (userData.occupation === 'farmer' && userData.income < 200000) {
                    isEligible = true;
                    reason = 'You are eligible as a farmer with income below ₹2 lakhs';
                }
                break;
                
            case 2: // PM Scholarship
                if (userData.age >= 18 && userData.education === 'graduate' && userData.income < 600000) {
                    isEligible = true;
                    reason = 'You meet all criteria for the scholarship';
                }
                break;
                
            case 3: // Old Age Pension
                if (userData.age >= 60 && userData.income < 100000) {
                    isEligible = true;
                    reason = 'You are eligible for old age pension';
                }
                break;
                
            case 4: // PM Ujjwala
                if (userData.gender === 'female' && userData.income < 100000) {
                    isEligible = true;
                    reason = 'You are eligible for PM Ujjwala Yojana';
                }
                break;
        }
        
        if (isEligible) {
            eligibleSchemes.push({ scheme, reason });
        }
    });
    
    if (eligibleSchemes.length > 0) {
        const message = `Congratulations! You are eligible for ${eligibleSchemes.length} scheme(s). Check your dashboard for details.`;
        sendNotification(message, 'success');
        
        // Show notification in UI
        showNotification(message, 'success');
        updateNotifBadge();
    }
}

// Enhanced voice command processing with Hindi support
function processVoiceCommand(transcript) {
    const command = transcript.toLowerCase();
    
    // Hindi commands
    if (currentVoiceLanguage === 'hi-IN') {
        if (command.includes('योजना') || command.includes('scheme')) {
            addChatMessage('bot', 'यहां उपलब्ध सरकारी योजनाएं हैं। आप किसी भी योजना पर क्लिक करके अधिक जानकारी प्राप्त कर सकते हैं।');
            showAllSchemes();
        } else if (command.includes('पात्रता') || command.includes('eligibility')) {
            addChatMessage('bot', 'मैं आपकी पात्रता जांचने में मदद कर सकता हूं। कृपया नीचे दिए गए फॉर्म को भरें या अपनी उम्र, आय और व्यवसाय बताएं।');
            setTimeout(() => {
                eligibilitySection.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        } else if (command.includes('डीबीटी') || command.includes('dbt')) {
            addChatMessage('bot', 'मैं आपकी डीबीटी खाता स्थिति जांचने में मदद कर सकता हूं।');
            setTimeout(() => {
                showDbtModal();
            }, 1000);
        } else {
            addChatMessage('bot', 'मैंने समझा: "' + transcript + '"। मैं आपकी कैसे मदद कर सकता हूं? आप योजनाओं, पात्रता या डीबीटी खाता जांच के बारे में पूछ सकते हैं।');
        }
    } else {
        // English commands (existing logic)
        if (command.includes('eligibility') || command.includes('check eligibility')) {
            addChatMessage('bot', 'I can help you check your eligibility for government schemes. Please fill out the eligibility form below or tell me your age, income, and occupation.');
            setTimeout(() => {
                eligibilitySection.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        } else if (command.includes('schemes') || command.includes('show schemes')) {
            addChatMessage('bot', 'Here are the available government schemes. You can click on any scheme to learn more about it.');
            showAllSchemes();
        } else if (command.includes('dbt') || command.includes('account')) {
            addChatMessage('bot', 'I can help you check your DBT account status. Let me open the DBT account verification for you.');
            setTimeout(() => {
                showDbtModal();
            }, 1000);
        } else if (command.includes('agriculture') || command.includes('farmer')) {
            addChatMessage('bot', 'You might be interested in PM Kisan Yojana. This scheme provides direct income support to farmers.');
            filterSchemesByCategory('agriculture');
        } else if (command.includes('education') || command.includes('student')) {
            addChatMessage('bot', 'For students, there\'s the PM Scholarship scheme available for higher education.');
            filterSchemesByCategory('education');
        } else if (command.includes('pension') || command.includes('old age')) {
            addChatMessage('bot', 'The Old Age Pension Scheme is available for citizens above 60 years of age.');
            filterSchemesByCategory('social-welfare');
        } else if (command.includes('women') || command.includes('lpg')) {
            addChatMessage('bot', 'PM Ujjwala Yojana provides free LPG connections to women from BPL families.');
            filterSchemesByCategory('women-welfare');
        } else {
            addChatMessage('bot', 'I understand you said: "' + transcript + '". How can I help you with government schemes? You can ask about eligibility, specific schemes, or DBT account verification.');
        }
    }
}

// Show Profile
function showProfile() {
    if (userData) {
        alert(`Welcome back, ${userData.fullName}! Your account is active and you will receive notifications for eligible schemes.`);
    } else {
        showLoginModal();
    }
}

// Scroll to Eligibility
function scrollToEligibility() {
    eligibilitySection.scrollIntoView({ behavior: 'smooth' });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.scheme-card, .category-card').forEach(el => {
    observer.observe(el);
});

// Add loading states to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.id !== 'startVoiceBtn' && !this.classList.contains('close-btn')) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }
    });
});

// Add hover effects to cards
document.querySelectorAll('.scheme-card, .category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Modern Navbar Features
// Initialize notification badge
function initNotificationBadge() {
    const notificationBadge = document.getElementById('notifBadge');
    const notificationBtn = document.getElementById('notificationsBtn');
    
    // Simulate some notifications for demo
    let notificationCount = 2;
    
    if (notificationBadge && notificationCount > 0) {
        notificationBadge.textContent = notificationCount;
        notificationBadge.style.display = 'flex';
    }
    
    // Click handler for notifications
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            // Hide badge when opened
            if (notificationBadge) {
                notificationBadge.style.display = 'none';
                notificationCount = 0;
            }
        });
    }
}

// Initialize notification badge when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationBadge);
} else {
    initNotificationBadge();
}

console.log('MyScheme Portal initialized successfully!');