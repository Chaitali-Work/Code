require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const app = express();
const port = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the Besu node
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const stableCoinAbi = [
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function totalSupply() public view returns (uint256)",
    "function balanceOf(address account) public view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)"
];

// Address of the deployed StableCoin contract
const stableCoinAddress = '0x7245DD72025d4D4BE79051c99562Acf592a7eeDe';
const stableCoinContract = new ethers.Contract(stableCoinAddress, stableCoinAbi, wallet);

// GET endpoint to retrieve the name of token
app.get('/name', async (req, res) => {
    try {
        const name = await stableCoinContract.name();
        res.json({ name });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving name');
    }
});

// GET endpoint to retrieve the symbol of token
app.get('/symbol', async (req, res) => {
    try {
        const symbol = await stableCoinContract.symbol();
        res.json({ symbol });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving symbol');
    }
});

// GET endpoint to retrieve the total supply of the token
app.get('/totalSupply', async (req, res) => {
    try {
        const totalSupply = await stableCoinContract.totalSupply();
        res.json({ totalSupply: totalSupply.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving total supply');
    }
});

// GET endpoint to retrieve the balance of an address
app.get('/balance/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const balance = await stableCoinContract.balanceOf(address);
        res.json({ address, balance: balance.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving balance');
    }
})

// POST endpoint to mint new coins
app.post('/mint', async (req, res) => {
    try {
        const { to, amount } = req.body;
        // Check if the 'to' address is the zero address
        if (to === ethers.ZeroAddress) {
            return res.status(400).send('Cannot mint to zero address');
        }
        const tx = await stableCoinContract.mint(to, amount);
        await tx.wait(); // Wait for transaction to be mined
        res.send('Minting successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error minting coins');
    }
});

// POST endpoint to burn coin
app.post('/burn', async (req, res) => {
    try {
        const { amount } = req.body;
        const senderAddress = wallet.address;
        // Check the sender's balance before attempting to burn
        const balance = await stableCoinContract.balanceOf(senderAddress);
        if (balance <= amount) {
            return res.status(400).send('Burning amount exceeds coin balance');
        }
        const tx = await stableCoinContract.burn(amount);
        await tx.wait(); // Wait for transaction to be mined
        res.send('Burning successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error burning coins');
    }
});

// POST endpoint to transfer tokens
app.post('/transfer', async (req, res) => {
    try {
        const { to, amount } = req.body;
        const tx = await stableCoinContract.transfer(to, amount);
        await tx.wait(); // Wait for transaction to be mined
        res.send('Transfer successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error transferring tokens');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});