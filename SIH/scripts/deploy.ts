import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const TouristID = await hre.ethers.getContractFactory("TouristID");
  const touristID = await TouristID.deploy();

  await touristID.waitForDeployment();

  console.log(`✅ TouristID contract deployed at: ${await touristID.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
