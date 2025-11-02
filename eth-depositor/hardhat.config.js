require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    holesky: {
      url: "https://ethereum-holesky-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 17000
    },
    hoodi: {
      url: process.env.ETHEREUM_RPC_URL || "https://0xrpc.io/hoodi",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 560048
    },
    holesky: {
      url: "https://ethereum-holesky-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 17000
    }
  }
};
