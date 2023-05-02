const { artifacts, ethers } = require("hardhat");
const hardhat = require("hardhat");
const fs = require("fs");

const makeDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const checkUndefinedContract = (
  name: string,
  contract: any,
  dir: string,
  artifacts: any
) => {
  if (contract === undefined) {
    fs.writeFileSync(
      `${dir}/${name}.json`,
      JSON.stringify({ ...artifacts }, undefined, 4)
    );
    return;
  }
};

const writeFile = (name: string, contract: any, artifact: any, dir: string) => {
  fs.writeFileSync(
    `${dir}/${name}.json`,
    JSON.stringify(
      { contractAddress: contract.address, ...artifact },
      undefined,
      4
    )
  );
};

function saveJsonFilesToClientFolder(name: string, contract: any) {
  const { DIR_NAME } = process.env;
  const eventDir = `${__dirname}/${DIR_NAME}`;

  makeDir(eventDir);

  const contractArtifact = artifacts.readArtifactSync(name);
  checkUndefinedContract(name, contract, eventDir, contractArtifact);
  writeFile(name, contract, contractArtifact, eventDir);
}

async function main() {
  const { PRIVATE_NETWORK_DEPLOY_CONTRACT_KEY } = process.env;
  const wallet = new ethers.Wallet(
    PRIVATE_NETWORK_DEPLOY_CONTRACT_KEY,
    hardhat.ethers.provider
  );

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  console.log("MyToken contract address : ", myToken.address);
  console.log("done deploy");

  console.log("mint token");
  await myToken.mint("0x0A774ea1Ed2Fd9A79266Dc2fF167acB8c2482E12", 15);
  console.log("mint done");

  saveJsonFilesToClientFolder("MyToken", myToken);
  console.log("update json file done");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run --network privates scripts/deploy.ts
