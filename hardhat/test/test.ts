const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Lottery Contract", function () {
  async function deployLottery() {
    /*
      Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
      Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

      Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
      Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
    */
    const [signer, otherAccount] = await ethers.getSigners();

    const Tether = await ethers.getContractFactory("TetherToken");
    const tether = await Tether.deploy(1000000, "TMAX_Tokens", "TMAX", 10);

    // const MyToken = await ethers.getContractFactory("MyToken");
    // const myToken = await MyToken.deploy("TMAX_Tokens", "TMAX");
    const sizeOfLottery = 5;
    const numberOfRange = 6;
    const costPerTickets = 1;

    const Lottery = await ethers.getContractFactory("Lottery");

    // const lottery = await Lottery.deploy(
    //   myToken.address,
    //   6,
    //   costPerTickets,
    //   oracleTestAddr.address
    // );

    const lottery = await Lottery.deploy(
      tether.address,
      sizeOfLottery,
      numberOfRange,
      costPerTickets
    );

    return {
      signer,
      otherAccount,
      tether,
      lottery,
      sizeOfLottery,
      numberOfRange,
      costPerTickets,
    };
  }

  // describe("Deploy Contract", async function () {
  //   it("Should BUY!!", async function () {
  //     const { signer, otherAccount, lottery, costPerTickets, tether } =
  //       await deployLottery();

  //     await lottery.setCurrentTime();
  //     const currentTime = await lottery.getCurrentTime();

  //     await lottery.createNewLottery(
  //
  //       Number(currentTime) - 10,
  //       Number(currentTime) + 10
  //     );

  //     // approve signer and other account to lottery address
  //     await tether.approve(lottery.address, 1000);
  //     await tether.transfer(otherAccount.address, 2000);
  //     await tether.connect(otherAccount).approve(lottery.address, 1000);
  //     console.log(11111111111111);

  //     await lottery.buyLottery(1, [1, 2, 3, 4, 5, 6]);
  //     console.log(22222222222222222);
  //     const allBuyers = await lottery.getAllBuyerInfo(1);

  //     expect(await lottery.owner()).to.be.equal(signer.address);
  //   });
  // });

  describe("Deploy Contract", async function () {
    it("Should set the right owner", async function () {
      const { signer, lottery } = await deployLottery();

      expect(await lottery.owner()).to.be.equal(signer.address);
    });
  });

  describe("create new Lottery", async function () {
    it("Should create right Lottery", async function () {
      const { lottery, costPerTickets } = await deployLottery();
      await lottery.setCurrentTime();
      const currentTime = await lottery.getCurrentTime();

      await lottery.createNewLottery(
        Number(currentTime) - 10,
        Number(currentTime) + 10
      );

      await lottery.setCurrentTime();

      const {
        lotteryID,
        lotteryStatus,
        prizePoolInTmax,
        costPerTicket,
        winningNumbers,
      } = await lottery.getBasicLottoInfo(1);

      expect(
        lotteryID,
        lotteryStatus,
        prizePoolInTmax,
        costPerTicket
      ).to.be.equal(
        ethers.utils.parseUnits(String(1), 0),
        1,
        ethers.utils.parseUnits(String(costPerTickets), 0)
      );

      expect(winningNumbers).to.be.an.instanceof(Array);
    });

    it("Should get the right lottery", async function () {
      const { lottery } = await deployLottery();
      await lottery.setCurrentTime();
      const currentTime = await lottery.getCurrentTime();

      await lottery.createNewLottery(
        Number(currentTime) - 10,
        Number(currentTime) + 10
      );

      expect(await lottery.getBasicLottoInfo(1)).to.deep.equal(
        await lottery.getLatestLotteryInfo()
      );
    });
  });

  describe("Buy Lottery", async function () {
    it("Should buy new lottery", async function () {
      const { signer, otherAccount, lottery, tether } = await deployLottery();

      await lottery.setCurrentTime();
      const currentTime = await lottery.getCurrentTime();

      await lottery.createNewLottery(
        Number(currentTime) - 10,
        Number(currentTime) + 10
      );
      // approve signer and other account to lottery address
      await tether.approve(lottery.address, 1000);
      await tether.transfer(otherAccount.address, 2000);
      await tether.connect(otherAccount).approve(lottery.address, 1000);

      await lottery.connect(otherAccount).buyLottery(1, [1, 2, 3, 4, 5]);

      await lottery.buyLottery(1, [5, 3, 4, 2, 1]);
      const allBuyers = await lottery.getAllBuyerInfo(1);

      expect(
        await lottery.ownerOfGameId(allBuyers[0].lotteryGameId)
      ).to.be.equal(otherAccount.address);
      expect(
        await lottery.ownerOfGameId(allBuyers[1].lotteryGameId)
      ).to.be.equal(signer.address);
    });

    it("Should fail drawing new numbers", async function () {
      const { otherAccount, lottery } = await deployLottery();

      await ethers.provider.send("evm_increaseTime", [600]);
      // await time.increase(10);
      await ethers.provider.send("evm_mine");
      await lottery.setCurrentTime();

      expect(
        await lottery.connect(otherAccount).drawWinningNumbers(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should drawing new numbers", async function () {
      const { lottery } = await deployLottery();

      await lottery.setCurrentTime();
      const currentTime = await lottery.getCurrentTime();

      await lottery.createNewLottery(
        Number(currentTime) - 10,
        Number(currentTime) + 10
      );

      await lottery.setLotteryClose(1);
      await ethers.provider.send("evm_increaseTime", [600]);
      await ethers.provider.send("evm_mine");

      await lottery.setCurrentTime();

      await lottery.drawWinningNumbers(1);

      const { winningNumbers } = await lottery.getBasicLottoInfo(1);
      console.log(winningNumbers);

      expect(winningNumbers).to.not.have.members([
        ethers.utils.parseUnits(String(0), 0),
      ]);
    });
  });

  describe("Send Prizers", async function () {
    it("Should find prizers", async function () {
      const { otherAccount, lottery, tether } = await deployLottery();

      await lottery.setCurrentTime();
      const currentTime = await lottery.getCurrentTime();

      await lottery.createNewLottery(
        Number(currentTime) - 10,
        Number(currentTime) + 10
      );

      // approve signer and other account to lottery address
      await tether.approve(lottery.address, 1000);
      await tether.transfer(otherAccount.address, 2000);
      await tether.connect(otherAccount).approve(lottery.address, 1000);

      await lottery.connect(otherAccount).buyLottery(1, [1, 2, 3, 4, 5]);
      await lottery.connect(otherAccount).buyLottery(1, [1, 5, 3, 4, 3]);
      await lottery.connect(otherAccount).buyLottery(1, [1, 3, 2, 4, 5]);
      await lottery.connect(otherAccount).buyLottery(1, [4, 2, 3, 1, 5]);
      await lottery.connect(otherAccount).buyLottery(1, [2, 1, 3, 4, 5]);

      await lottery.buyLottery(1, [2, 3, 4, 5, 1]);
      await lottery.buyLottery(1, [2, 1, 4, 5, 3]);
      await lottery.buyLottery(1, [2, 3, 4, 1, 5]);
      await lottery.buyLottery(1, [2, 1, 4, 5, 3]);
      await lottery.buyLottery(1, [3, 1, 4, 5, 2]);

      await ethers.provider.send("evm_increaseTime", [600]);
      await ethers.provider.send("evm_mine");

      await lottery.setCurrentTime();

      await lottery.drawWinningNumbers(1);
      await lottery.setWinningNums(1); // test func
      // console.log("당첨 번호", await lottery.getLatestLotteryInfo());
      await lottery.findWinners(1);

      const no1 = await lottery.getCntWinner(1, 1);

      expect(Number(no1) >= 1).to.be.equal(true); // test func
    });

    it("Should cal prizers", async function () {
      const { signer, otherAccount, lottery, tether } = await deployLottery();

      await lottery.setCurrentTime();
      const currentTime = await lottery.getCurrentTime();

      await lottery.createNewLottery(
        Number(currentTime) - 10,
        Number(currentTime) + 10
      );
      // approve signer and other account to lottery address
      await tether.approve(lottery.address, 200000);
      await tether.transfer(otherAccount.address, 2000);
      await tether.connect(otherAccount).approve(lottery.address, 1000);

      await lottery.openEvent(1000);
      const prizeDistribution1 = await lottery.getBasicLottoInfo(1);

      await lottery.connect(otherAccount).buyLottery(1, [1, 2, 3, 4, 5]);
      await lottery.connect(otherAccount).buyLottery(1, [1, 5, 3, 4, 3]);
      await lottery.connect(otherAccount).buyLottery(1, [1, 3, 2, 4, 5]);
      await lottery.connect(otherAccount).buyLottery(1, [4, 2, 3, 1, 5]);
      await lottery.connect(otherAccount).buyLottery(1, [2, 1, 3, 4, 5]);

      await lottery.buyLottery(1, [2, 3, 4, 5, 1]);
      await lottery.buyLottery(1, [2, 1, 4, 5, 3]);
      await lottery.buyLottery(1, [2, 3, 4, 1, 5]);
      await lottery.buyLottery(1, [2, 1, 4, 5, 3]);
      await lottery.buyLottery(1, [3, 1, 4, 5, 2]);

      await ethers.provider.send("evm_increaseTime", [600]);
      await ethers.provider.send("evm_mine");

      await lottery.setCurrentTime();

      await lottery.drawWinningNumbers(1);
      await lottery.setWinningNums(1); // test func
      const latestLotto = await lottery.getLatestLotteryInfo();
      await lottery.findWinners(1);

      await lottery.calPrizes(1);

      const myGames = await lottery.getMyWinnerGameIds(
        1,
        otherAccount.address,
        1
      );

      const prizeDistribution = await lottery.getBasicLottoInfo(1);
      const no1 = await lottery.getCntWinner(1, 1);

      const beforeToken = await tether.balanceOf(otherAccount.address);
      console.log("before", beforeToken);
      await lottery.connect(otherAccount).withdrawPrizes(1, myGames[0], 1);

      const afterToken = await tether.balanceOf(otherAccount.address);
      console.log("after", afterToken);

      expect(Number(no1) >= 1).to.be.equal(true); // test func
      expect(Number(afterToken - beforeToken)).to.be.equal(600);
    });
  });
});

// await lottery.getbasicLottoInfo(1);
