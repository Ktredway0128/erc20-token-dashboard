# ERC-20 TOKEN DASHBOARD

[![Verified on Etherscan](https://img.shields.io/badge/Etherscan-Verified-brightgreen)](https://sepolia.etherscan.io/address/0x036150039c33b1645080a9c913f96d4c65ccca48#code)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-blue)](https://erc20-token-dashboard.netlify.app/)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Ethers.js](https://img.shields.io/badge/Ethers.js-5.8-purple)
![Network](https://img.shields.io/badge/Network-Sepolia-green)

Built by [Kyle Tredway Development](https://kyle-tredway-portfolio.netlify.app/) — professional Solidity smart contract packages for Web3 companies.

A production-ready React frontend for interacting with a deployed ERC-20 token contract.

> ⚠️ This dashboard is connected to the Sepolia test network for demonstration purposes only.
> Token distribution is managed by the deployer via direct transfer, mint, or airdrop contract.
> These contracts have not been professionally audited. A full security audit is strongly recommended before any mainnet deployment.

This project demonstrates the full lifecycle of a token management dashboard including:

- Wallet connection and network validation
- Real-time token data display
- Role-based admin controls
- Transaction feedback with Etherscan verification

The repository represents the frontend layer of an ERC-20 Token Launch package, designed to work alongside the ERC-20 Token Launch Contract. It can be extended to support crowdsales, vesting dashboards, airdrop interfaces, and DAO governance panels.


## PROJECT GOALS

The purpose of this project is to demonstrate how a modern ERC-20 token dashboard should be designed for real-world use.

The dashboard includes common features required by token management interfaces:

- Live token data loaded from the blockchain
- Wallet-based role detection
- Protected admin functions
- User-friendly transaction status and error handling
- Etherscan transaction verification

These patterns are widely used in production Web3 applications.


## DASHBOARD FEATURES

### WALLET CONNECTION

The dashboard connects to MetaMask and automatically detects the connected wallet's roles.
A network check ensures the user is on the correct chain before connecting.
The UI refreshes automatically when the wallet is switched inside MetaMask.

### LIVE TOKEN DATA

On connection, the dashboard loads the following data directly from the contract:

- Token Name
- Token Symbol
- Total Supply
- Maximum Cap
- Connected Wallet Balance

### TRANSFER TOKENS

Any connected wallet can transfer tokens to another address.
Input validation prevents empty fields, zero amounts, and self-transfers.
MetaMask handles signing and broadcasting the transaction.

### BURN TOKENS

Any token holder can permanently destroy tokens from their own balance.
Burning is available to all wallets, not just admin wallets.
Each successful burn links directly to the Etherscan transaction.

### ROLE-BASED ADMIN PANEL

The admin panel is only visible to wallets holding administrative roles.
Non-admin wallets see a notice that admin functions exist but are restricted to authorized wallets.

Admin functions include:

| Function | Role Required | Description |
|----------|--------------|-------------|
| Mint Tokens | MINTER_ROLE | Mint new tokens to any address up to the cap |
| Pause Token | PAUSER_ROLE | Pause all token transfers for emergency use |
| Unpause Token | PAUSER_ROLE | Resume all token transfers |

### TRANSACTION FEEDBACK

Every action triggers a color-coded status bar with a loading spinner:

| Action | Status Color |
|--------|-------------|
| Transferring | Amber |
| Minting | Dark Green |
| Burning | Dark Red |
| Pausing / Unpausing | Amber |
| Success | Bright Green |
| Error | Red |

On success, a clickable Etherscan link appears for immediate transaction verification.

### ERROR HANDLING

User-friendly error messages are displayed for common failure cases:

- Token is paused
- Transaction rejected in MetaMask
- Insufficient funds
- Transfer amount exceeds balance
- General transaction failure


## TECHNOLOGY STACK

This project was built using the following tools:

- React – Frontend framework
- Ethers.js – Contract interaction library
- MetaMask – Wallet provider
- Alchemy – Ethereum RPC provider for reads
- Tailwind CSS – Utility-first styling
- Sepolia Test Network – Deployment environment


## PROJECT STRUCTURE

```
src/
    App.js
    App.css
    index.js
    contracts/
        SampleToken.json
        sepolia.json

public/
    index.html

.env
```

### APP.JS

Contains all wallet connection logic, contract interaction, and UI rendering.

### CONTRACTS

Contains the ABI and deployed contract address pulled in at runtime.

### ENV

Contains the Alchemy RPC URL used for all read operations.


## INSTALLATION

### CLONE THE REPOSITORY:

```bash
git clone https://github.com/Ktredway0128/erc20-token-dashboard
cd erc20-token-dashboard
```

### INSTALL DEPENDENCIES:

```bash
npm install
```

### START THE DEVELOPMENT SERVER:

```bash
npm start
```


## ENVIRONMENT SETUP

Create a `.env` file in the root directory:

```
REACT_APP_ALCHEMY_URL=YOUR_SEPOLIA_ALCHEMY_URL
```

This value allows the dashboard to:

- Read token data directly from the blockchain via Alchemy
- Bypass MetaMask's RPC for all read operations


## HOW TO USE

### CONNECTING YOUR WALLET

1. Make sure MetaMask is installed in your browser
2. Switch MetaMask to the **Sepolia** test network
3. Click **Connect Wallet**
4. Approve the connection in MetaMask

### TRANSFERRING TOKENS

1. Enter the recipient wallet address in the address field
2. Enter the amount of tokens to send
3. Click **Send**
4. Confirm the transaction in MetaMask
5. Wait for the confirmation — a green success bar with an Etherscan link will appear

### BURNING TOKENS

1. Enter the amount of tokens to burn
2. Click **Burn**
3. Confirm the transaction in MetaMask
4. Burned tokens are sent to the zero address and permanently destroyed

### MINTING TOKENS (Admin Only)

1. Connect with a wallet that holds the MINTER_ROLE
2. Enter the destination address in the mint field
3. Enter the amount to mint
4. Click **Mint**
5. Confirm the transaction in MetaMask

### PAUSING THE TOKEN (Admin Only)

1. Connect with a wallet that holds the PAUSER_ROLE
2. Click **Pause Token** to halt all transfers
3. Click **Unpause Token** to resume transfers
4. Token status is displayed in real time


## PROVIDER ARCHITECTURE

The dashboard uses a dual-provider setup for optimal performance and reliability:

| Provider | Purpose |
|----------|---------|
| MetaMask (Web3Provider) | Signs and broadcasts all write transactions |
| Alchemy (JsonRpcProvider) | Handles all read operations |

This separation ensures reads are fast and reliable while writes are always signed by the user's wallet.


## SEPOLIA TESTNET DEPLOYMENT

| Contract | Address | Etherscan |
|----------|---------|-----------|
| SampleToken | `0x036150039c33b1645080a9c913f96D4c65ccca48` | [View on Etherscan](https://sepolia.etherscan.io/address/0x036150039c33b1645080a9c913f96D4c65ccca48#code) |

Deployed: 2026-03-19


## EXAMPLE TOKEN CONFIGURATION

Example parameters used with this dashboard:

- Token Name: Sample Token
- Token Symbol: STK
- Maximum Supply: 1,000,000 tokens
- Initial Supply: 100,000 tokens


## SECURITY PRACTICES

The dashboard enforces security at two levels:

**UI Level**
- Admin panel is hidden from non-admin wallets
- Network check prevents connection on wrong chain
- Input validation prevents invalid transactions

**Contract Level**
- All role checks are enforced by the smart contract
- The UI is a convenience layer — the contract is the source of truth
- No transaction can bypass the contract's access control


## EXAMPLE USE CASES

This dashboard architecture can support many types of projects:

- DAO governance token management
- Startup utility token administration
- Game economy token controls
- Loyalty rewards distribution
- DeFi protocol token management


## FUTURE ENHANCEMENTS

This dashboard serves as the frontend layer for a larger Web3 infrastructure package.

Possible upgrades include:

- Airdrop interface
- Investor vesting dashboard
- Staking rewards panel
- Governance voting interface
- Multi-wallet admin management
- Mainnet deployment


## AUTHOR

Kyle Tredway

Smart Contract Developer / Token Launch Specialist


## LICENSE

MIT License