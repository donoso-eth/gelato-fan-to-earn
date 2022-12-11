//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import {IOps} from "./gelato/IOps.sol";
import {LibDataTypes} from "./gelato/LibDataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

enum NFTStatus {
  PAUSED,
  LISTED,
  BORROWED
}

struct NFTLending {
  uint256 id;
  uint256 start;
  uint256 duration;
  uint256 cost;
  NFTStatus  status;
}

contract FanToEarn is ERC721 {

  /// ERC721
  uint256 tokenId;


  //// GELATO
  IOps public ops;
  address payable public gelato;
  address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  bytes32 public finishingVotingTask;

  mapping(uint256 => NFTLending) public nftLending;

  constructor(IOps _ops) ERC721("name", "symbol") {
    ops = _ops;
  }

  // #region  ========== =============  ERC721  ============= ============= //
  function _beforeTokenTransfer(
    address,
    address,
    uint256 _tokenId,
    uint256
  ) internal view override {
    require(nftLending[_tokenId].status != NFTStatus.BORROWED,'NFT_IS_BORROWED');


  }


  function safeMint(address to) external {
    tokenId++;
    _safeMint(to,tokenId,"0x");
  }


  // #endregion  ========== =============  ERC721  ============= ============= //

  // #region  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //

  //@dev creating the  gelato task
  function createLendingTask() internal returns (bytes32 taskId) {
    // //@dev executing function encoded
    // bytes memory execData = abi.encodeWithSelector(this.finishVoting.selector);
    // LibDataTypes.Module[] memory modules = new LibDataTypes.Module[](2);
    // //@dev using execution prefixed at a certain interval and soing only one execution
    // modules[0] = LibDataTypes.Module.TIME;
    // modules[1] = LibDataTypes.Module.SINGLE_EXEC;
    // bytes[] memory args = new bytes[](1);
    // args[0] = timeArgs;
    // LibDataTypes.ModuleData memory moduleData = LibDataTypes.ModuleData(
    //   modules,
    //   args
    // );
    // //@dev  task creation
    // taskId = IOps(ops).createTask(address(this), execData, moduleData, ETH);
  }

  //@dev executing function to be called by Gelato
  function finishVoting() public onlyOps {}

  //@dev transfer fees to Gelato
  function transfer(uint256 _amount, address _paymentToken) internal {
    (bool success, ) = gelato.call{value: _amount}("");
    require(success, "_transfer: ETH transfer failed");
  }

  //@dev only Gelato modifier
  modifier onlyOps() {
    require(msg.sender == address(ops), "OpsReady: onlyOps");
    _;
  }

  // #endregion  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //
}
