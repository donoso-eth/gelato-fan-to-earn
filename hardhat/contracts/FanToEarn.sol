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
  NFTStatus status;
  address borrower;
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

  // #region  ========== =============  LENDING LOGIC  ============= ============= //

  function listToken(
    uint256 _tokenId,
    uint256 cost,
    uint256 duration
  ) external onlyPaused(_tokenId) onlyTokenOwner(_tokenId) {
    nftLending[_tokenId] = NFTLending(
      _tokenId,
      0,
      duration,
      cost,
      NFTStatus.LISTED,
      address(0)
    );
  }

  function removeListing(
    uint256 _tokenId
  ) external onlyTokenOwner(_tokenId) onlyListed(_tokenId) {
    nftLending[_tokenId].status = NFTStatus.PAUSED;
  }

  function borrowNft(uint256 _tokenId) external payable {
    NFTLending storage nft = nftLending[_tokenId];

    require(msg.value > nft.cost, "NOT_ENOUGH_ETH_SENT");

    _safeTransfer(_ownerOf(_tokenId),msg.sender,_tokenId,"0x");
    nftLending[_tokenId].status == NFTStatus.BORROWED;
    _createReturnNftTaksk(_tokenId,nft.duration, msg.sender);
    (bool success, ) = payable(_ownerOf(_tokenId)).call{value: msg.value}("");
    require(success, "_transfer: ETH transfer failed");

  }

  modifier onlyPaused(uint256 _tokenId) {
    require(
      nftLending[_tokenId].status == NFTStatus.PAUSED,
      "NFT_NOT_LISTINGABLE"
    );
    _;
  }

  modifier onlyListed(uint256 _tokenId) {
    require(nftLending[_tokenId].status == NFTStatus.LISTED, "NFT_NOT_LISTED");
    _;
  }

  modifier onlyTokenOwner(uint256 _tokenId) {
    require(_ownerOf(_tokenId) == msg.sender, "NOT_THIS_NFT_OWNER");
    _;
  }

  // #endregion  ========== =============  LENDING LOGIC  ============= ============= //

  // #region  ========== =============  ERC721  ============= ============= //
  function _beforeTokenTransfer(
    address,
    address,
    uint256 _tokenId,
    uint256
  ) internal override {
    require(
      nftLending[_tokenId].status != NFTStatus.BORROWED,
      "NFT_IS_BORROWED"
    );

    nftLending[_tokenId].status = NFTStatus.PAUSED;
  }

  function safeMint(address to) external {
    tokenId++;
    _safeMint(to, tokenId, "0x");
  }

  // #endregion  ========== =============  ERC721  ============= ============= //

  // #region  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //

  //@dev creating the  gelato task
  function _createReturnNftTaksk(uint256 _tokenId, uint256 duration, address _borrower) internal returns (bytes32 taskId) {
    bytes memory timeArgs = abi.encode(
      uint128(block.timestamp + duration),
      duration
    );

    //@dev executing function encoded
    bytes memory execData = abi.encodeWithSelector(this.returnNft.selector,_tokenId,_borrower);
    LibDataTypes.Module[] memory modules = new LibDataTypes.Module[](2);
    //@dev using execution prefixed at a certain interval and soing only one execution
    modules[0] = LibDataTypes.Module.TIME;
    modules[1] = LibDataTypes.Module.SINGLE_EXEC;
    bytes[] memory args = new bytes[](1);
    args[0] = timeArgs;
    LibDataTypes.ModuleData memory moduleData = LibDataTypes.ModuleData(
      modules,
      args
    );
    //@dev  task creation
    taskId = IOps(ops).createTask(address(this), execData, moduleData, ETH);
  }

  //@dev executing function to be called by Gelato
  function returnNft(uint256 _tokenId, address _borrower) public onlyOps {
    nftLending[_tokenId].status = NFTStatus.LISTED;
    _safeTransfer(_ownerOf(_tokenId),_borrower,_tokenId,"0x");
    
  }

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
