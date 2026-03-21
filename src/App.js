import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import SampleTokenABI from './contracts/SampleToken.json';
import sepoliaDeployment from './contracts/sepolia.json';

const TOKEN_ADDRESS = sepoliaDeployment.SampleToken.address;
const ABI = SampleTokenABI.abi;

function App() {
  const [contract, setContract] = useState(null);
  const [readContract, setReadContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [cap, setCap] = useState('');
  const [balance, setBalance] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMinter, setIsMinter] = useState(false);
  const [isPauser, setIsPauser] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus('MetaMask not found. Please install it.');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        setStatus('Please switch MetaMask to the Sepolia network.');
        return;
      }

      const metaMaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = metaMaskProvider.getSigner();
      const _account = await _signer.getAddress();

      const alchemyProvider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_ALCHEMY_URL,
        { name: 'sepolia', chainId: 11155111 }
      );

      const _contract = new ethers.Contract(TOKEN_ADDRESS, ABI, _signer);
      const _readContract = new ethers.Contract(TOKEN_ADDRESS, ABI, alchemyProvider);

      setContract(_contract);
      setReadContract(_readContract);
      setAccount(_account);

      await loadTokenData(_readContract, _account);
    } catch (err) {
      setStatus('Error connecting wallet: ' + err.message);
    }
  };

  const loadTokenData = async (_contract, _account) => {
    try {
      const name = await _contract.name();
      const symbol = await _contract.symbol();
      const supply = await _contract.totalSupply();
      const capAmount = await _contract.cap();
      const bal = await _contract.balanceOf(_account);

      const ADMIN_ROLE = await _contract.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await _contract.MINTER_ROLE();
      const PAUSER_ROLE = await _contract.PAUSER_ROLE();

      const adminCheck = await _contract.hasRole(ADMIN_ROLE, _account);
      const minterCheck = await _contract.hasRole(MINTER_ROLE, _account);
      const pauserCheck = await _contract.hasRole(PAUSER_ROLE, _account);
      const paused = await _contract.paused();

      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(ethers.utils.formatUnits(supply, 18));
      setCap(ethers.utils.formatUnits(capAmount, 18));
      setBalance(ethers.utils.formatUnits(bal, 18));
      setIsAdmin(adminCheck);
      setIsMinter(minterCheck);
      setIsPauser(pauserCheck);
      setIsPaused(paused);
    } catch (err) {
      setStatus('Error loading token data: ' + err.message);
    }
  };

  const handleTransfer = async () => {
    try {
      setStatus('Transferring...');
      const tx = await contract.transfer(
        transferTo,
        ethers.utils.parseUnits(transferAmount, 18)
      );
      await tx.wait();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('Transfer successful!');
      await loadTokenData(readContract, account);
      setTransferTo('');
      setTransferAmount('');
    } catch (err) {
      if (err.message.includes('paused')) {
        setStatus('Token is paused. All transactions are rejected.');
      } else {
        setStatus('Transfer failed: ' + err.message);
      }
    }
  };

  const handleMint = async () => {
    try {
      setStatus('Minting...');
      const tx = await contract.mint(
        mintTo,
        ethers.utils.parseUnits(mintAmount, 18)
      );
      await tx.wait();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('Mint successful!');
      await loadTokenData(readContract, account);
      setMintTo('');
      setMintAmount('');
    } catch (err) {
      if (err.message.includes('paused')) {
        setStatus('Token is paused. All transactions are rejected.');
      } else {
        setStatus('Transfer failed: ' + err.message);
      }
    }
  };

  const handleBurn = async () => {
    try {
      setStatus('Burning...');
      const tx = await contract.burn(
        ethers.utils.parseUnits(burnAmount, 18)
      );
      await tx.wait();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('Burn successful!');
      await loadTokenData(readContract, account);
      setBurnAmount('');
    } catch (err) {
      if (err.message.includes('paused')) {
        setStatus('Token is paused. All transactions are rejected.');
      } else {
        setStatus('Transfer failed: ' + err.message);
      }
    }
  };

  const handlePause = async () => {
    try {
      setStatus(isPaused ? 'Unpausing...' : 'Pausing...');
      const tx = isPaused ? await contract.unpause() : await contract.pause();
      await tx.wait();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus(isPaused ? 'Token unpaused!' : 'Token paused!');
      await loadTokenData(readContract, account);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="shimmer-bg"></div>
      <div className="content min-h-screen p-8">

        {/* HEADER */}
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#0f4c5c' }}>
                {tokenName || 'ERC-20'} <span style={{ color: '#f59e0b' }}>Dashboard</span>
              </h1>
              <p className="text-sm mt-2 uppercase tracking-widest font-medium" style={{ color: '#64748b' }}>
                Token Management Interface
              </p>
            </div>
            {account && (
              <div className="text-right">
                <p className="text-xs font-mono" style={{ color: '#64748b' }}>
                  Connected
                </p>
                <p className="text-sm font-mono font-semibold" style={{ color: '#0f4c5c' }}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
            )}
          </div>
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.5)', marginBottom: '2rem' }} />

          {/* STATUS MESSAGE */}
          {status && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#e0f2fe', color: '#0f4c5c' }}>
              {status}
            </div>
          )}

          {!account ? (
            <div className="text-center py-32">
              <div className="mb-6 text-6xl">🔗</div>
              <button
                onClick={connectWallet}
                className="px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 mb-6"
                style={{ backgroundColor: '#f59e0b' }}
              >
                Connect Wallet
              </button>
              <p className="text-3xl font-bold mb-3 tracking-tight" style={{ color: '#0f4c5c' }}>
                Connect your wallet to get started
              </p>
              <p className="text-sm uppercase tracking-widest" style={{ color: '#64748b' }}>
                Make sure you're on the Sepolia test network
              </p>
            </div>
          ) : (
            <>
              {/* TOKEN STATS + BALANCE */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {[
                  { label: 'Token Name', value: tokenName },
                  { label: 'Symbol', value: tokenSymbol },
                  { label: 'Total Supply', value: Number(totalSupply).toLocaleString() },
                  { label: 'Max Cap', value: Number(cap).toLocaleString() },
                  { label: 'Your Balance', value: Number(balance).toLocaleString() + ' ' + tokenSymbol },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl p-4 shadow-sm card-hover"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderLeft: '4px solid #0f4c5c'
                    }}>
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#64748b' }}>
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold" style={{ color: stat.label === 'Your Balance' ? '#f59e0b' : '#0f4c5c' }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* TRANSFER */}
              <div className="rounded-2xl p-6 mb-8 shadow-sm card-hover"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  borderLeft: '4px solid #0f4c5c'
                }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#0f4c5c' }}>
                  Transfer Tokens
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Recipient address (0x...)"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ borderColor: '#bae6fd', color: '#334155' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-32 border rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ borderColor: '#bae6fd', color: '#334155' }}
                  />
                  <button
                    onClick={handleTransfer}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 btn-hover"
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* BURN - available to all token holders */}
              <div className="rounded-2xl p-6 mb-8 shadow-sm card-hover"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  borderLeft: '4px solid #0f4c5c'
                }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#0f4c5c' }}>
                  Burn Tokens
                </h2>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Amount to burn"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="w-48 border rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ borderColor: '#bae6fd', color: '#6b0f1a' }}
                  />
                  <button
                    onClick={handleBurn}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 btn-hover"
                    style={{ backgroundColor: '#6b0f1a' }}
                  >
                    Burn
                  </button>
                </div>
              </div>

              {/* ADMIN PANEL */}
              {(isAdmin || isMinter || isPauser) && (
                <div className="rounded-2xl p-6 shadow-sm card-hover"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderLeft: '4px solid #0f4c5c'
                  }}>
                  <h2 className="text-xl font-bold mb-6" style={{ color: '#0f4c5c' }}>
                    Admin Panel
                  </h2>

                  {/* MINT */}
                  {isMinter && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold mb-2" style={{ color: '#1a5c38' }}>Mint Tokens</p>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="Mint to address (0x...)"
                          value={mintTo}
                          onChange={(e) => setMintTo(e.target.value)}
                          className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ borderColor: '#bae6fd', color: '#1a5c38' }}
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={mintAmount}
                          onChange={(e) => setMintAmount(e.target.value)}
                          className="w-36 border rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ borderColor: '#bae6fd', color: '#1a5c38' }}
                        />
                        <button
                          onClick={handleMint}
                          className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 btn-hover"
                          style={{ backgroundColor: '#1a5c38' }}
                        >
                          Mint
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PAUSE */}
                  {isPauser && (
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-semibold" style={{ color: '#0f4c5c' }}>
                        Token Status: <span style={{ color: isPaused ? '#6b0f1a' : '#22c55e' }}>
                          {isPaused ? 'Paused' : 'Active'}
                        </span>
                      </p>
                      <button
                        onClick={handlePause}
                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 btn-hover"
                        style={{ backgroundColor: isPaused ? '#22c55e' : '#6b0f1a' }}
                      >
                        {isPaused ? 'Unpause Token' : 'Pause Token'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;