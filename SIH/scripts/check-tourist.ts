import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  // Replace with the address you want to check
  const touristAddress = "0x509a51662F3F329044683327Ca28d9f8370E3066";

  const abi = [
    {
      "inputs": [
        { "internalType": "address", "name": "_wallet", "type": "address" }
      ],
      "name": "getTourist",
      "outputs": [
        {
          "components": [
            { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" },
            { "internalType": "uint256", "name": "startDate", "type": "uint256" },
            { "internalType": "uint256", "name": "endDate", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" }
          ],
          "internalType": "struct TouristID.Tourist",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const tourist = await contract.getTourist(touristAddress);

  console.log("Tourist details for", touristAddress);
  console.log("Data Hash:", tourist.dataHash);
  console.log("Start Date:", new Date(Number(tourist.startDate) * 1000));
  console.log("End Date:", new Date(Number(tourist.endDate) * 1000));
  console.log("Is Active:", tourist.isActive);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
