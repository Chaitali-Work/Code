// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StableCoinOld {
    string public name = "SecureCoin";
    string public symbol = "SC";
    // uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public rewards;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event RewardIssued(address indexed to, uint256 value);

    constructor() {
        owner = msg.sender;
        // uint256 initialSupply = 1000 * (10 ** uint256(decimals));
        uint256 initialSupply = 1000;
        mint(owner, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function issueReward(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot issue reward to zero address");
        totalSupply += amount;    
        rewards[to] += amount;       
        emit RewardIssued(to, amount);
    }
    
    function claimReward(uint256 amount) public {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        require(amount <= reward, "Claim amount exceeds rewards balance");
        rewards[msg.sender] -= amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function getBalances(address account) public view returns (uint256 tokenBalance, uint256 rewardBalance) {
        tokenBalance = balanceOf[account];
        rewardBalance = rewards[account];
    }

}