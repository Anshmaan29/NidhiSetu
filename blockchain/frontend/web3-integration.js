// Web3 Integration for Nidhisetu Portal
// Handles blockchain connectivity with graceful demo fallback

class BlockchainIntegration {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.isConnected = false;
        this.isDemoMode = false;

        // Contract addresses (update after deployment)
        this.contractAddresses = {
            citizenRegistry: '0x...',
            schemeEligibility: '0x...',
            benefitTracker: '0x...'
        };

        this.init();
    }

    async init() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('🔗 MetaMask detected!');
            try {
                this.web3 = new ethers.providers.Web3Provider(window.ethereum);
                this.setupEventListeners();
            } catch (e) {
                console.log('ethers init error, demo mode active');
                this.isDemoMode = true;
            }
        } else {
            console.log('ℹ️ MetaMask not found – running in demo mode');
            this.isDemoMode = true;
        }
    }

    // Connect to MetaMask wallet (or demo mode)
    async connectWallet() {
        try {
            this.setButtonState('loading');

            if (this.isDemoMode || !window.ethereum) {
                // ── DEMO MODE ────────────────────────────────────────────
                await this._sleep(800); // simulate network delay
                this.account = '0xDe03...A1B2'; // fake address
                this.isConnected = true;
                this.isDemoMode = true;

                this.setButtonState('demo');

                localStorage.setItem('walletConnected', 'demo');
                localStorage.setItem('walletAddress', this.account);

                if (window.updateWalletStatus) {
                    window.updateWalletStatus(true, this.account);
                }

                this.showNotification('✅ Demo wallet connected! Now click Login to continue.', 'success');
                return this.account;
            }

            // ── REAL MetaMask ─────────────────────────────────────────────
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            this.isConnected = true;

            try { await this.switchToAmoy(); } catch (e) {
                console.log('Network switch skipped:', e.message);
            }

            this.setButtonState('connected');

            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', this.account);

            if (window.updateWalletStatus) {
                window.updateWalletStatus(true, this.account);
            }

            this.showNotification('🎉 Wallet connected to Amoy testnet!', 'success');
            return this.account;

        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            this.setButtonState('disconnected');

            if (error.code === 4001) {
                this.showNotification('Connection cancelled by user.', 'info');
            } else {
                this.showNotification('Failed to connect. Please try again.', 'error');
            }
            throw error;
        }
    }

    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // Switch to Polygon Amoy Testnet
    async switchToAmoy() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13882' }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await this.addAmoyNetwork();
            } else {
                throw switchError;
            }
        }
    }

    async addAmoyNetwork() {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/']
            }]
        });
    }

    // Setup MetaMask event listeners
    setupEventListeners() {
        if (!window.ethereum) return;
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) { this.disconnect(); }
            else { this.account = accounts[0]; this.updateWalletUI(); }
        });
        window.ethereum.on('chainChanged', () => window.location.reload());
    }

    disconnect() {
        this.account = null;
        this.isConnected = false;
        this.isDemoMode = false;
        this.contracts = {};
        this.setButtonState('disconnected');
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        this.showNotification('Wallet disconnected', 'info');
    }

    // ── Button states ──────────────────────────────────────────────────────
    setButtonState(state) {
        const btn = document.getElementById('connectWalletBtn');
        if (!btn) return;

        btn.classList.remove('connected', 'loading', 'disconnected', 'error', 'demo');

        switch (state) {
            case 'loading':
                btn.classList.add('loading');
                btn.innerHTML = `
                    <div class="btn-icon"><i class="fas fa-spinner fa-spin"></i></div>
                    <span class="btn-text">Connecting...</span>
                    <div class="connection-indicator"></div>`;
                break;

            case 'connected': {
                btn.classList.add('connected');
                const short = `${this.account.slice(0,6)}...${this.account.slice(-4)}`;
                btn.setAttribute('data-tooltip', `Connected: ${this.account}`);
                btn.innerHTML = `
                    <div class="btn-icon"><i class="fas fa-check-circle"></i></div>
                    <span class="btn-text">${short}</span>
                    <div class="connection-indicator"></div>`;
                btn.onclick = () => window.open(`https://amoy.polygonscan.com/address/${this.account}`, '_blank');
                break;
            }

            case 'demo':
                btn.classList.add('connected');
                btn.setAttribute('data-tooltip', 'Demo wallet active');
                btn.innerHTML = `
                    <div class="btn-icon"><i class="fas fa-check-circle"></i></div>
                    <span class="btn-text">Demo Wallet ✓</span>
                    <div class="connection-indicator"></div>`;
                btn.onclick = null;
                break;

            case 'error':
                btn.classList.add('error');
                btn.innerHTML = `
                    <div class="btn-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <span class="btn-text">Retry Connect</span>
                    <div class="connection-indicator"></div>`;
                setTimeout(() => this.setButtonState('disconnected'), 3000);
                break;

            case 'disconnected':
            default:
                btn.classList.add('disconnected');
                btn.setAttribute('data-tooltip', 'Connect your MetaMask wallet (or use demo)');
                btn.innerHTML = `
                    <div class="btn-icon"><i class="fas fa-wallet"></i></div>
                    <span class="btn-text">Connect Wallet</span>
                    <div class="connection-indicator"></div>`;
                btn.onclick = () => this.connectWallet();
                break;
        }
    }

    updateWalletUI() {
        const walletStatus = document.getElementById('walletStatus');
        if (this.isConnected && this.account) {
            this.setButtonState(this.isDemoMode ? 'demo' : 'connected');
            if (walletStatus) {
                const label = this.isDemoMode ? 'Demo Wallet Active' : 'Wallet Connected';
                walletStatus.innerHTML = `
                    <div class="wallet-connected">
                        <i class="fas fa-check-circle"></i>
                        <span>${label}: ${this.account.slice(0,8)}...${this.account.slice(-4)}</span>
                    </div>`;
            }
        } else {
            this.setButtonState('disconnected');
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <div class="wallet-disconnected">
                        <i class="fas fa-times-circle"></i>
                        <span>Wallet Not Connected (optional for demo)</span>
                    </div>`;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Prefer the global showNotification if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        n.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '<i class="fas fa-check-circle"></i>'
                    : type === 'error'   ? '<i class="fas fa-times-circle"></i>'
                    : '<i class="fas fa-info-circle"></i>'}
                </div>
                <div class="notification-text">${message}</div>
            </div>`;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 5000);
    }
}

// Initialize & expose globally
window.blockchain = new BlockchainIntegration();

        
        // Contract addresses (update after deployment)
        this.contractAddresses = {
            citizenRegistry: "0x...", // Update with deployed address
            schemeEligibility: "0x...", // Update with deployed address
            benefitTracker: "0x..." // Update with deployed address
        };
        
        this.init();
    }
    
    async init() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('🔗 MetaMask detected!');
            this.web3 = new ethers.providers.Web3Provider(window.ethereum);
            this.setupEventListeners();
        } else {
            console.log('❌ MetaMask not found. Please install MetaMask.');
            this.showInstallMetaMaskPrompt();
        }
    }
    
    // Connect to MetaMask wallet
    async connectWallet() {
        const connectBtn = document.getElementById('connectWalletBtn');
        
        try {
            // Show loading state
            this.setButtonState('loading');
            
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }
            
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            this.account = accounts[0];
            this.isConnected = true;
            
            // Try to switch to Amoy but don't fail if user cancels
            try {
                await this.switchToAmoy();
            } catch (networkError) {
                console.log('Network switch cancelled, continuing with current network');
            }
            
            // Skip contract initialization for now (demo mode)
            // await this.initializeContracts();
            
            // Update UI with success state
            this.setButtonState('connected');
            
            // Store connection state
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', this.account);
            
            // Update wallet status in login modal if available
            if (window.updateWalletStatus) {
                window.updateWalletStatus(true, this.account);
            }
            
            console.log('✅ Wallet connected:', this.account);
            this.showNotification('Wallet connected successfully to Amoy testnet! 🎉', 'success');
            
            return this.account;
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            this.setButtonState('disconnected');
            
            if (error.message === 'MetaMask not installed') {
                this.showNotification('Please install MetaMask to continue', 'error');
                setTimeout(() => {
                    this.showInstallMetaMaskPrompt();
                }, 1000);
            } else if (error.code === 4001) {
                this.showNotification('Connection cancelled by user', 'info');
            } else {
                this.showNotification('Failed to connect wallet. Please try again.', 'error');
            }
            throw error;
        }
    }
    
    // Switch to Polygon Amoy Testnet
    async switchToAmoy() {
        try {
            // First try to switch to Amoy
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13882' }], // 80002 in hex (Amoy)
            });
            console.log('✅ Switched to Amoy testnet');
        } catch (switchError) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
                console.log('📡 Adding Amoy network...');
                await this.addAmoyNetwork();
            } else {
                console.error('❌ Failed to switch to Amoy:', switchError);
                throw switchError;
            }
        }
    }
    
    // Add Polygon Amoy Network to MetaMask
    async addAmoyNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x13882', // 80002 in hex
                    chainName: 'Polygon Amoy Testnet',
                    nativeCurrency: {
                        name: 'MATIC',
                        symbol: 'MATIC',
                        decimals: 18
                    },
                    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                    blockExplorerUrls: ['https://amoy.polygonscan.com/']
                }]
            });
            console.log('✅ Amoy network added successfully');
        } catch (addError) {
            console.error('❌ Failed to add Amoy network:', addError);
            throw addError;
        }
    }    // Initialize smart contracts
    async initializeContracts() {
        const signer = this.web3.getSigner();
        
        // CitizenRegistry contract
        this.contracts.citizenRegistry = new ethers.Contract(
            this.contractAddresses.citizenRegistry,
            CITIZEN_REGISTRY_ABI,
            signer
        );
        
        // SchemeEligibility contract
        this.contracts.schemeEligibility = new ethers.Contract(
            this.contractAddresses.schemeEligibility,
            SCHEME_ELIGIBILITY_ABI,
            signer
        );
        
        // BenefitTracker contract
        this.contracts.benefitTracker = new ethers.Contract(
            this.contractAddresses.benefitTracker,
            BENEFIT_TRACKER_ABI,
            signer
        );
        
        console.log('📋 Smart contracts initialized');
    }
    
    // Register citizen on blockchain
    async registerCitizen(citizenData) {
        try {
            if (!this.isConnected) {
                await this.connectWallet();
            }
            
            const {
                name,
                aadhaarNumber,
                phoneNumber,
                age,
                gender,
                category,
                annualIncome
            } = citizenData;
            
            // Hash Aadhaar for privacy
            const aadhaarHash = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(aadhaarNumber)
            );
            
            // Call smart contract
            const tx = await this.contracts.citizenRegistry.registerCitizen(
                name,
                aadhaarHash,
                phoneNumber,
                age,
                gender,
                category,
                annualIncome
            );
            
            this.showNotification('Transaction submitted. Please wait...', 'info');
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            
            console.log('✅ Citizen registered on blockchain:', receipt);
            this.showNotification('Successfully registered on blockchain!', 'success');
            
            return receipt;
        } catch (error) {
            console.error('❌ Error registering citizen:', error);
            this.showNotification('Failed to register on blockchain', 'error');
            throw error;
        }
    }
    
    // Apply for scheme on blockchain
    async applyForScheme(schemeType) {
        try {
            if (!this.isConnected) {
                await this.connectWallet();
            }
            
            // Map scheme names to enum values
            const schemeTypeMap = {
                'PM_KISAN': 0,
                'PM_SCHOLARSHIP': 1,
                'OLD_AGE_PENSION': 2,
                'PM_UJJWALA': 3,
                'EMPLOYMENT_SCHEME': 4,
                'HEALTHCARE_SCHEME': 5
            };
            
            const schemeId = schemeTypeMap[schemeType];
            
            // Call smart contract
            const tx = await this.contracts.schemeEligibility.applyForScheme(schemeId);
            
            this.showNotification('Application submitted to blockchain...', 'info');
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            
            console.log('✅ Scheme application submitted:', receipt);
            this.showNotification('Application submitted successfully!', 'success');
            
            return receipt;
        } catch (error) {
            console.error('❌ Error applying for scheme:', error);
            this.showNotification('Failed to submit application', 'error');
            throw error;
        }
    }
    
    // Check application status
    async checkApplicationStatus(schemeType) {
        try {
            const schemeTypeMap = {
                'PM_KISAN': 0,
                'PM_SCHOLARSHIP': 1,
                'OLD_AGE_PENSION': 2,
                'PM_UJJWALA': 3,
                'EMPLOYMENT_SCHEME': 4,
                'HEALTHCARE_SCHEME': 5
            };
            
            const schemeId = schemeTypeMap[schemeType];
            
            const status = await this.contracts.schemeEligibility.getApplicationStatus(
                this.account,
                schemeId
            );
            
            return {
                status: status.status,
                reason: status.reason,
                applicationTime: status.applicationTime,
                decisionTime: status.decisionTime,
                benefitDisbursed: status.benefitDisbursed,
                benefitAmount: status.benefitAmount
            };
        } catch (error) {
            console.error('❌ Error checking application status:', error);
            throw error;
        }
    }
    
    // Track benefit disbursement
    async trackBenefit(transactionId) {
        try {
            const transaction = await this.contracts.benefitTracker.trackTransaction(transactionId);
            
            return {
                status: transaction.status,
                initiatedTime: transaction.initiatedTime,
                approvedTime: transaction.approvedTime,
                disbursedTime: transaction.disbursedTime,
                remarks: transaction.remarks
            };
        } catch (error) {
            console.error('❌ Error tracking benefit:', error);
            throw error;
        }
    }
    
    // Get citizen verification status
    async getCitizenStatus() {
        try {
            if (!this.account) return null;
            
            const isRegistered = await this.contracts.citizenRegistry.isRegistered(this.account);
            
            if (!isRegistered) {
                return { registered: false };
            }
            
            const citizen = await this.contracts.citizenRegistry.getCitizen(this.account);
            
            return {
                registered: true,
                name: citizen.name,
                age: citizen.age,
                gender: citizen.gender,
                category: citizen.category,
                annualIncome: citizen.annualIncome,
                verified: citizen.isVerified,
                registrationTime: citizen.registrationTime
            };
        } catch (error) {
            console.error('❌ Error getting citizen status:', error);
            return { registered: false };
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Account changed
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.account = accounts[0];
                this.updateWalletUI();
            }
        });
        
        // Network changed
        window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
        });
    }
    
    // Disconnect wallet
    disconnect() {
        this.account = null;
        this.isConnected = false;
        this.contracts = {};
        this.setButtonState('disconnected');
        this.updateWalletUI();
        this.showNotification('Wallet disconnected', 'info');
    }
    
    // Set button state with enhanced animations
    setButtonState(state) {
        const connectBtn = document.getElementById('connectWalletBtn');
        if (!connectBtn) return;
        
        // Remove all state classes
        connectBtn.classList.remove('connected', 'loading', 'disconnected', 'error');
        
        switch (state) {
            case 'loading':
                connectBtn.classList.add('loading');
                connectBtn.setAttribute('data-tooltip', 'Connecting to MetaMask...');
                connectBtn.innerHTML = `
                    <div class="btn-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <span class="btn-text">Connecting...</span>
                    <div class="connection-indicator"></div>
                `;
                break;
                
            case 'connected':
                connectBtn.classList.add('connected');
                const shortAddress = `${this.account.substring(0, 6)}...${this.account.substring(38)}`;
                connectBtn.setAttribute('data-tooltip', `Connected: ${this.account}`);
                connectBtn.innerHTML = `
                    <div class="btn-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <span class="btn-text">${shortAddress}</span>
                    <div class="connection-indicator"></div>
                `;
                
                // Add click handler for connected state to view on explorer
                connectBtn.onclick = () => {
                    window.open(`https://amoy.polygonscan.com/address/${this.account}`, '_blank');
                };
                break;
                
            case 'error':
                connectBtn.classList.add('error');
                connectBtn.setAttribute('data-tooltip', 'Connection failed. Click to retry.');
                connectBtn.innerHTML = `
                    <div class="btn-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <span class="btn-text">Connection Failed</span>
                    <div class="connection-indicator"></div>
                `;
                
                // Reset click handler after error
                setTimeout(() => {
                    this.setButtonState('disconnected');
                }, 3000);
                break;
                
            case 'disconnected':
            default:
                connectBtn.classList.add('disconnected');
                connectBtn.setAttribute('data-tooltip', 'Connect your MetaMask wallet');
                connectBtn.innerHTML = `
                    <div class="btn-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <span class="btn-text">Connect Wallet</span>
                    <div class="connection-indicator"></div>
                `;
                
                // Reset click handler
                connectBtn.onclick = () => this.connectWallet();
                break;
        }
    }
    
    // Add ripple effect on button click
    addRippleEffect(button) {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            button.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // Enhanced wallet UI updates
    updateWalletUI() {
        const walletStatus = document.getElementById('walletStatus');
        
        if (this.isConnected && this.account) {
            this.setButtonState('connected');
            
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <div class="wallet-connected">
                        <i class="fas fa-check-circle"></i>
                        <span>Wallet Connected</span>
                        <div class="wallet-details">
                            <small>Address: ${this.account.substring(0, 8)}...${this.account.substring(36)}</small>
                        </div>
                    </div>
                `;
            }
        } else {
            this.setButtonState('disconnected');
            
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <div class="wallet-disconnected">
                        <i class="fas fa-times-circle"></i>
                        <span>Wallet Not Connected</span>
                        <div class="wallet-help">
                            <small>Connect your MetaMask wallet to use blockchain features</small>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Show MetaMask install prompt
    showInstallMetaMaskPrompt() {
        const modal = document.createElement('div');
        modal.className = 'modal blockchain-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fab fa-ethereum"></i> MetaMask Required</h2>
                </div>
                <div class="modal-body">
                    <p>To use blockchain features, please install MetaMask wallet:</p>
                    <div class="install-steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Install MetaMask</h4>
                                <p>Download and install MetaMask browser extension</p>
                                <a href="https://metamask.io/download/" target="_blank" class="btn btn-primary">
                                    <i class="fas fa-download"></i> Download MetaMask
                                </a>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Get Test MATIC</h4>
                                <p>Get free test tokens for Amoy testnet</p>
                                <a href="https://faucet.polygon.technology/" target="_blank" class="btn btn-outline">
                                    <i class="fas fa-coins"></i> Get Test Tokens
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                      type === 'error' ? '<i class="fas fa-times-circle"></i>' : 
                      '<i class="fas fa-info-circle"></i>'}
                </div>
                <div class="notification-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize blockchain integration
const blockchain = new BlockchainIntegration();

// Export for use in main script
window.blockchain = blockchain;