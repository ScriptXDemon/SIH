import { useState } from 'react';
import { createWalletClient, custom, keccak256, toHex, encodeFunctionData } from 'viem';
// import { mainnet } from 'viem/chains';

// Localhost chain config for Hardhat/Ganache
const localhost = {
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
  blockExplorers: undefined,
  testnet: true,
};

// TypeScript: Add window.ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- Configuration ---
// The address from your deployment
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// The Application Binary Interface (ABI) for your contract (full JSON ABI required by viem)
const contractAbi = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "TouristExpired",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "dataHash", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "startDate", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "endDate", "type": "uint256" }
    ],
    "name": "TouristRegistered",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" }
    ],
    "name": "expireTourist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" },
      { "internalType": "bytes32", "name": "_dataHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "_startDate", "type": "uint256" },
      { "internalType": "uint256", "name": "_endDate", "type": "uint256" }
    ],
    "name": "registerTourist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


function App() {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [status, setStatus] = useState<string>('Please connect your wallet.');
  const [formData, setFormData] = useState({
    name: '',
    passport: '',
    startDate: '',
    endDate: ''
  });
  // Tourist ID check state
  const [checkAddress, setCheckAddress] = useState<string>("");
  const [touristInfo, setTouristInfo] = useState<any | null>(null);
  // Check Tourist ID handler
  const handleCheckTourist = async () => {
    setTouristInfo(null);
    setStatus("Checking tourist details...");
    try {
      // Use viem's public client for read-only call
      const res = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: encodeFunctionData({
            abi: contractAbi,
            functionName: 'getTourist',
            args: [checkAddress],
          })
        }, 'latest']
      });
      // viem's decodeFunctionResult
      const { decodeFunctionResult } = await import('viem');
      const decoded = decodeFunctionResult({
        abi: contractAbi,
        functionName: 'getTourist',
        data: res
      });
      setTouristInfo(decoded);
      setStatus("Tourist details loaded.");
    } catch (err) {
      setTouristInfo(null);
      setStatus("❌ Failed to fetch tourist details. Check address and try again.");
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setStatus('MetaMask is not installed. Please install it to continue.');
      return;
    }
    try {
      // Request accounts from MetaMask
      const addresses: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = addresses[0] as `0x${string}`;
      setAccount(address);
      setStatus(`✅ Wallet connected: ${address}`);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setStatus('Failed to connect wallet. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!account) {
      setStatus('Please connect your wallet first.');
      return;
    }

    setStatus('Processing registration...');

    // 1. Combine and Hash Data
    const { name, passport, startDate, endDate } = formData;
    if (!name || !passport || !startDate || !endDate) {
        setStatus('❌ Error: Please fill in all fields.');
        return;
    }
    const combinedData = `${name}-${passport}`;
    const dataHash = keccak256(toHex(combinedData));
    setStatus(`🔏 Generated Hash: ${dataHash.substring(0, 10)}...`);

    // 2. Convert Dates to Timestamps
    const startTimestamp = BigInt(Math.floor(new Date(startDate).getTime() / 1000));
    const endTimestamp = BigInt(Math.floor(new Date(endDate).getTime() / 1000));

    // 3. Send Transaction
    try {
      const walletClient = createWalletClient({
        account,
        chain: localhost,
        transport: custom(window.ethereum!)
      });

      setStatus('Sending transaction... Please approve in MetaMask.');

      // Use viem's sendTransaction for contract interaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: contractAddress,
          data: encodeFunctionData({
            abi: contractAbi,
            functionName: 'registerTourist',
            args: [account, dataHash, startTimestamp, endTimestamp],
          })
        }]
      });

      setStatus(`✅ Transaction sent! Waiting for confirmation... Hash: ${String(txHash).substring(0, 10)}...`);
      setTimeout(() => setStatus(`Tourist ID registered successfully for ${account}`), 3000);

    } catch (error) {
      console.error("Registration failed:", error);
      setStatus('❌ Registration failed. Check the console for details.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h1>Tourist Digital ID Registration</h1>
      <p>{status}</p>

      {/* Registration UI */}
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
          <input name="passport" placeholder="Passport or Aadhaar No." value={formData.passport} onChange={handleInputChange} />
          <label>Start Date: <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} /></label>
          <label>End Date: <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} /></label>
          <button onClick={handleRegister}>Register Tourist ID</button>
        </div>
      )}

      {/* Tourist ID Check UI */}
      <hr style={{ margin: '30px 0' }} />
      <h2>Check Tourist ID</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          placeholder="Enter wallet address to check"
          value={checkAddress}
          onChange={e => setCheckAddress(e.target.value)}
        />
        <button onClick={handleCheckTourist}>Check Tourist Details</button>
      </div>
      {touristInfo && (
        <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          {touristInfo.dataHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ? (
            <div><b>No tourist registered for this address.</b></div>
          ) : (
            <>
              <h3>Tourist Info</h3>
              <div><b>Data Hash:</b> {touristInfo.dataHash}</div>
              <div><b>Start Date:</b> {new Date(Number(touristInfo.startDate) * 1000).toLocaleString()}</div>
              <div><b>End Date:</b> {new Date(Number(touristInfo.endDate) * 1000).toLocaleString()}</div>
              <div><b>Is Active:</b> {touristInfo.isActive ? 'Yes' : 'No'}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;