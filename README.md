<div align="center">

# 🏆 NidhiSetu — Government Benefits Made Easy

### *Winner at Smart BU Hackathon — Ranked 17th out of 700+ Teams* 🎉

[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)]()
[![Made with](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)]()

<br/>

> **NidhiSetu** (निधिसेतु — *Bridge to Benefits*) is an AI-powered government scheme discovery portal that helps Indian citizens find, verify, and apply for government schemes they're eligible for — with voice assistance, blockchain verification, and multi-language support.

<br/>

</div>

---

## 🏅 Hackathon Achievement

| 🏆 Event | 📊 Rank | 👥 Competing Teams |
|---|---|---|
| **Smart India Hackathon (SIH)** | **17th** | **650** |

We are proud to announce that **NidhiSetu won at the Smart India Hackathon (SIH)**, securing **17th place out of 650 teams**! This achievement validates our vision of making government benefits accessible to every citizen of India through technology.

---

## 🚀 Live Features

### 🔍 Smart Scheme Discovery
- **AI-powered eligibility engine** that matches users to 500+ government schemes based on age, income, gender, occupation, category, and education level
- Category-wise browsing — Agriculture, Education, Healthcare, Women Welfare, Employment, Social Welfare

### 🎙️ Voice Assistant (Multilingual)
- Voice-activated chatbot using **Web Speech API**
- Natural language processing for scheme queries
- Supports **English, Hindi (हिंदी), and Tamil (தமிழ்)**

### 🔗 Blockchain Integration
- **MetaMask wallet** connectivity for secure identity verification
- Citizen registration on **Polygon Amoy Testnet**
- Smart contracts for transparent benefit tracking (*Solidity + Hardhat*)

### 🏦 DBT Account Verification
- Real-time **Aadhaar–Bank Account linkage** verification
- Guided verification flow with direct redirection to **UIDAI** and **DBT Bharat** portals

### 📲 Notification System
- WhatsApp & SMS notification preferences
- Real-time eligibility alerts when users become eligible for new schemes

### ♿ Accessibility
- High contrast mode & large text toggle
- Screen-reader friendly semantic HTML
- Responsive design for all device sizes

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5 · CSS3 · JavaScript (ES6+) · AOS Animations · Animate.css |
| **Voice AI** | Web Speech API (Recognition + Synthesis) |
| **Blockchain** | Solidity · Hardhat · Ethers.js · Polygon Amoy Testnet |
| **Backend** | Node.js · Express.js · MongoDB (Mongoose) |
| **Design** | Poppins · Noto Sans Devanagari/Tamil · Font Awesome 6 · Indian Tricolor Theme |

---

## 📁 Project Structure

```
NidhiSetu/
├── index.html                  # Main portal page
├── script.js                   # Core application logic (131KB)
├── styles.css                  # Main stylesheet with animations
├── styles-old.css              # Legacy styles
├── clear-storage.html          # Storage management utility
├── assets/
│   ├── images/schemes/         # Scheme card images
│   └── videos/                 # Hero section background video
├── blockchain/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── BenefitTracker.sol
│   │   ├── CitizenRegistry.sol
│   │   └── SchemeEligibility.sol
│   ├── frontend/               # Web3 integration scripts
│   ├── models/                 # MongoDB models
│   ├── scripts/                # Deployment scripts
│   ├── server.js               # Express API server
│   ├── hardhat.config.js       # Hardhat configuration
│   └── setup.sh                # Quick setup script
├── MONGODB-SETUP.md            # MongoDB configuration guide
├── blockchain-guide.md         # Blockchain setup documentation
├── testing-guide.md            # End-to-end testing guide
└── website-status-guide.md     # Deployment status guide
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v16+
- **MongoDB** (local or Atlas)
- **MetaMask** browser extension (for blockchain features)

### 1. Clone & Install

```bash
git clone https://github.com/Anshmaan29/NidhiSetu.git
cd NidhiSetu
```

### 2. Frontend (Static)

Simply open `index.html` in your browser — no build step required!

```bash
# Or use a local server:
npx serve .
```

### 3. Blockchain Backend (Optional)

```bash
cd blockchain
npm install
cp .env.example .env    # Configure your environment variables
node server.js          # Start the Express API
```

### 4. Smart Contract Deployment (Optional)

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy
```

> 📖 For detailed setup instructions, see [blockchain-guide.md](./blockchain-guide.md) and [MONGODB-SETUP.md](./MONGODB-SETUP.md)

---

## 🎯 Key Government Schemes Covered

| Scheme | Category | Benefit |
|---|---|---|
| **PM Kisan Yojana** | 🌾 Agriculture | ₹6,000/year for small farmers |
| **PM Scholarship** | 🎓 Education | Merit-based financial aid |
| **Old Age Pension** | 🏥 Social Welfare | Monthly pension for 60+ citizens |
| **PM Ujjwala Yojana** | 👩 Women Welfare | Free LPG connections for BPL families |

---

## 🎨 Design Philosophy

NidhiSetu features a **proud Indian design language**:
- 🇮🇳 **Tiranga-inspired** gradient color scheme (Saffron · White · Green)
- 🕉️ **Ashok Chakra** animated spinner in the header
- 🌐 **Multi-script typography** — Devanagari & Tamil alongside English
- ✨ **Modern glassmorphism** with smooth AOS scroll animations

---

## 🤝 Contributing

We welcome contributions! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for the citizens of India** 🇮🇳

*Making government schemes accessible to every citizen — one click at a time.*

<br/>

**⭐ Star this repo if you found it useful!**

</div>
