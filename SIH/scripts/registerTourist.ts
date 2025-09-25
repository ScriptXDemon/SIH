import { keccak256, toHex } from "viem";
import hre from "hardhat";
import { Contract } from "ethers";

// --- Configuration ---
// IMPORTANT: Replace this with the actual address after you run the deploy script
const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";;

// --- Mock Data ---
const mockTouristData = {
  walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // The first Hardhat test account
  name: "John Doe",
  nationality: "USA",
  passportOrAadhaar: "A12345678",
  itinerary: "Visit Taj Mahal",
  emergencyContact: "+1-555-123-4567",
};

// --- Main Function ---
async function main() {
  // Proceed without placeholder check
  
  console.log("Preparing to register a new tourist...");

  // 1. Combine and Hash the Data
  const combinedData = `${mockTouristData.name}-${mockTouristData.passportOrAadhaar}-${mockTouristData.nationality}`;
  const dataHash = keccak256(toHex(combinedData));
  console.log(`🔏 Generated Data Hash: ${dataHash}`);

  // 2. Set the Validity Period (e.g., 30 days from now)
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
  const startDate = BigInt(now);
  const endDate = BigInt(now + thirtyDaysInSeconds);
  console.log(`🗓️ Pass valid from ${new Date(Number(startDate) * 1000).toLocaleString()} to ${new Date(Number(endDate) * 1000).toLocaleString()}`);


  // 3. Get the Contract and Call the 'registerTourist' Function (Ethers style)
  const [signer] = await (hre as any).ethers.getSigners();
  const TouristID = await (hre as any).ethers.getContractFactory("TouristID", signer);
  const touristID = TouristID.attach(CONTRACT_ADDRESS) as Contract;

  console.log("\n📡 Sending transaction to register tourist...");
  const tx = await touristID.registerTourist(
    mockTouristData.walletAddress,
    dataHash,
    startDate,
    endDate
  );
  const receipt = await tx.wait();
  console.log(`✅ Transaction successful! Hash: ${tx.hash}`);

  // 4. Verify the Data
  console.log("\n🔍 Verifying stored data for wallet:", mockTouristData.walletAddress);
  const registeredTourist = await touristID.getTourist(mockTouristData.walletAddress);
  
  console.log("---------------------------------");
  console.log("✅ Verification Successful!");
  console.log("Stored Hash:", registeredTourist.dataHash);
  console.log("Start Date (timestamp):", registeredTourist.startDate.toString());
  console.log("End Date (timestamp):", registeredTourist.endDate.toString());
  console.log("Is Active:", registeredTourist.isActive);
  console.log("---------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});