import { useState } from 'react';
import { keccak256, toHex, encodeFunctionData } from 'viem';
// import { mainnet } from 'viem/chains';


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
  // DPDP Act: Consent state
  const [consent, setConsent] = useState(false);
  const [touristInfo, setTouristInfo] = useState<any | null>(null);

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
    if (!consent) {
      setStatus('❌ You must consent to the privacy policy to register.');
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

  // Expire Tourist ID handler
  const handleExpireTourist = async () => {
    if (!account) {
      setStatus('Please connect your wallet first.');
      return;
    }
    setStatus('Processing erasure (expire tourist)...');
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: contractAddress,
          data: encodeFunctionData({
            abi: contractAbi,
            functionName: 'expireTourist',
            args: [account],
          })
        }]
      });
      setStatus(`✅ Erasure request sent! Waiting for confirmation... Hash: ${String(txHash).substring(0, 10)}...`);
      setTimeout(() => setStatus(`Tourist ID expired (deactivated) for ${account}`), 3000);
    } catch (error) {
      console.error("Expire tourist failed:", error);
      setStatus('❌ Failed to expire tourist. Check the console for details.');
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
          {/* DPDP Act: Consent and privacy notice */}
          <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '6px', fontSize: '0.95em' }}>
            <b>Privacy Notice:</b> Your data will be hashed and stored on the blockchain. By registering, you consent to the processing of your data for the purpose of digital tourist identification. See our <a href="/privacy-policy.txt" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            I consent to the processing of my data as described above.
          </label>
          <button onClick={handleRegister}>Register Tourist ID</button>
          {/* DPDP Act: Erasure (expire) feature */}
          <button style={{ background: '#fbb', color: '#900', marginTop: '10px' }} onClick={handleExpireTourist}>
            Expire (Erase) My Tourist ID
          </button>
        </div>
      )}

      {/* Tourist ID Check UI */}
      <hr style={{ margin: '30px 0' }} />
      {/* My Tourist ID only (no generic check) */}
      <h2>My Tourist ID</h2>
      {account && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={async () => {
            setStatus('Checking your tourist ID...');
            setTouristInfo(null);
            try {
              const res = await window.ethereum.request({
                method: 'eth_call',
                params: [{
                  to: contractAddress,
                  data: encodeFunctionData({
                    abi: contractAbi,
                    functionName: 'getTourist',
                    args: [account],
                  })
                }, 'latest']
              });
              const { decodeFunctionResult } = await import('viem');
              const decoded = decodeFunctionResult({
                abi: contractAbi,
                functionName: 'getTourist',
                data: res
              });
              // Only show if isActive is true
              const info = decoded as { dataHash: string; startDate: bigint; endDate: bigint; isActive: boolean };
              if (info.isActive && info.dataHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                setTouristInfo(info);
                setStatus('Tourist details loaded.');
              } else {
                setTouristInfo(null);
                setStatus('No active Tourist ID found for your account.');
              }
            } catch (err) {
              setTouristInfo(null);
              setStatus('❌ Failed to fetch your tourist details.');
            }
          }}>
            Show My Tourist ID
          </button>
        </div>
      )}
      {touristInfo && (
        <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h3>Tourist Info</h3>
          <div><b>Data Hash:</b> {touristInfo.dataHash}</div>
          <div><b>Start Date:</b> {new Date(Number(touristInfo.startDate) * 1000).toLocaleString()}</div>
          <div><b>End Date:</b> {new Date(Number(touristInfo.endDate) * 1000).toLocaleString()}</div>
          <div><b>Is Active:</b> {touristInfo.isActive ? 'Yes' : 'No'}</div>
        </div>
      )}
      {/* Admin Contact and Compliance Info */}
      <hr style={{ margin: '30px 0' }} />
      <div style={{ fontSize: '0.95em', color: '#555' }}>
        <b>Admin Contact for Data Requests:</b> admin@touristid.example.com<br />
        For privacy or data-related requests, contact the admin or use the features above.<br />
        <i>Note: Closing your browser does not erase on-chain data. Use the "Expire" button to deactivate your Tourist ID.</i>
      </div>
    </div>
  );
}

export default App;