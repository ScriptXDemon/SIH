import { ethers } from "hardhat";

async function main() {
  const [sender] = await ethers.getSigners();
  // Hardcoded recipient address for local testing
  const recipient = "0x509a51662F3F329044683327Ca28d9f8370E3066";
  if (!ethers.isAddress(recipient)) {
    console.error("Invalid recipient address hardcoded in script.");
    process.exit(1);
  }
  console.log(`Sending 10 ETH from ${sender.address} to ${recipient}...`);
  const tx = await sender.sendTransaction({
    to: recipient,
    value: ethers.parseEther("10")
  });
  await tx.wait();
  console.log("✅ 10 ETH sent! Tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
