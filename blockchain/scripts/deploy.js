const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Nidhisetu Blockchain Contracts to Polygon Mumbai...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
  
  // Deploy CitizenRegistry contract
  console.log("\n1️⃣ Deploying CitizenRegistry...");
  const CitizenRegistry = await ethers.getContractFactory("CitizenRegistry");
  const citizenRegistry = await CitizenRegistry.deploy();
  await citizenRegistry.waitForDeployment();
  const citizenRegistryAddress = await citizenRegistry.getAddress();
  console.log("✅ CitizenRegistry deployed to:", citizenRegistryAddress);
  
  // Deploy SchemeEligibility contract
  console.log("\n2️⃣ Deploying SchemeEligibility...");
  const SchemeEligibility = await ethers.getContractFactory("SchemeEligibility");
  const schemeEligibility = await SchemeEligibility.deploy(citizenRegistryAddress);
  await schemeEligibility.waitForDeployment();
  const schemeEligibilityAddress = await schemeEligibility.getAddress();
  console.log("✅ SchemeEligibility deployed to:", schemeEligibilityAddress);
  
  // Deploy BenefitTracker contract (we'll create this next)
  console.log("\n3️⃣ Deploying BenefitTracker...");
  const BenefitTracker = await ethers.getContractFactory("BenefitTracker");
  const benefitTracker = await BenefitTracker.deploy(citizenRegistryAddress, schemeEligibilityAddress);
  await benefitTracker.waitForDeployment();
  const benefitTrackerAddress = await benefitTracker.getAddress();
  console.log("✅ BenefitTracker deployed to:", benefitTrackerAddress);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: "mumbai",
    citizenRegistry: citizenRegistryAddress,
    schemeEligibility: schemeEligibilityAddress,
    benefitTracker: benefitTrackerAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString()
  };
  
  console.log("\n🎉 All contracts deployed successfully!");
  console.log("📋 Deployment Summary:");
  console.log("====================");
  console.log("CitizenRegistry:", citizenRegistryAddress);
  console.log("SchemeEligibility:", schemeEligibilityAddress);
  console.log("BenefitTracker:", benefitTrackerAddress);
  
  // Verify contracts on Polygonscan (optional)
  console.log("\n🔍 To verify contracts on Polygonscan, run:");
  console.log(`npx hardhat verify --network mumbai ${citizenRegistryAddress}`);
  console.log(`npx hardhat verify --network mumbai ${schemeEligibilityAddress} ${citizenRegistryAddress}`);
  console.log(`npx hardhat verify --network mumbai ${benefitTrackerAddress} ${citizenRegistryAddress} ${schemeEligibilityAddress}`);
  
  // Save addresses to file for frontend integration
  const fs = require('fs');
  fs.writeFileSync(
    './deployment-addresses.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Contract addresses saved to deployment-addresses.json");
  console.log("🌐 You can now integrate these contracts with your frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });