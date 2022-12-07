import { expect } from "chai";
import { ethers } from "hardhat";

describe("FanToEarn", function () {
  it("Should return the new greeting once it's changed", async function () {
    const FanToEarn = await ethers.getContractFactory("FanToEarn");
    const fanToEarn = await capitalize(contractName).deploy();
    await fanToEarn.deployed();

  });
});
