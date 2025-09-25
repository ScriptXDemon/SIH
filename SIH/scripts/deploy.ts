import hre from "hardhat";

async function main() {
  console.log("Deploying TouristID contract...");



  // Get signer from Hardhat
  // Use ethers directly from hardhat
  const [deployer] = await (hre as any).ethers.getSigners();
  const TouristID = await (hre as any).ethers.getContractFactory("TouristID", deployer);
  const touristID = await TouristID.deploy();

  console.log(`✅ TouristID contract deployed at: ${touristID.target}`);

  return { contractAddress: touristID.target };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});