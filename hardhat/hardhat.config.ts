require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
import "@nomiclabs/hardhat-etherscan";
require("dotenv").config();

const { TEST_PRIVATE_KEY } = process.env;
const { ETHERSCAN_API_KEY } = process.env;
const { PRIVATE_NETWORK_TEST_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.1",
        settings: {},
      },
      {
        version: "0.8.7",
        settings: {},
      },
    ],
  },
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
    privates: {
      url: `http://192.168.153.143:8547`,
      accounts: [PRIVATE_NETWORK_TEST_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
