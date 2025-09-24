import hre from "hardhat";

async function main() {
  console.log("Deploying TouristID contract...");

  const TouristID = await hre.ethers.getContractFactory("TouristID");
  const touristID = await TouristID.deploy();

  await touristID.waitForDeployment();

  const contractAddress = await touristID.getAddress();
  console.log(`✅ TouristID contract deployed at: ${contractAddress}`);

  return { contractAddress };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
