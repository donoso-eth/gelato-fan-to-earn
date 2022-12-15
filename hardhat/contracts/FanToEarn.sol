//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import {IOps} from "./gelato/IOps.sol";
import {LibDataTypes} from "./gelato/LibDataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

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
  address owner;
  uint256 pos;
  bytes name;
  bytes32 returnTaskId;
}


  struct LentByUser {
      uint256 nrLent;
      uint256[] lents;
  }
contract FanToEarn is ERC721Enumerable {

 // owner
  address immutable owner;

  /// ERC721
  uint256 tokenId;

  //// GELATO
  IOps public ops;
  address payable public gelato;
  address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

  /// FAN TO EARN

  uint256 public nrNftsListed;

  uint256[] public nftsListed;

  mapping(uint256 => NFTLending) public nftLending;

  mapping(address => LentByUser) public nftLentByUser;

  constructor(IOps _ops) ERC721("name", "symbol") {
    owner = msg.sender;
    ops = _ops;
    gelato = IOps(_ops).gelato();
  }

  // #region  ========== =============  LENDING LOGIC  ============= ============= //

  function listToken(
    uint256 _tokenId,
    uint256 cost
  ) external onlyPaused(_tokenId) onlyTokenOwner(_tokenId) {
    nftLending[_tokenId].cost = cost;
    nftLending[_tokenId].status = NFTStatus.LISTED;
    nftLending[_tokenId].pos =  nrNftsListed;
    nftLending[_tokenId].owner = msg.sender;


    nftsListed.push(_tokenId);
    nrNftsListed++;

  }

  function removeListing(
    uint256 _tokenId
  ) external onlyTokenOwner(_tokenId) onlyListed(_tokenId) {
    nftLending[_tokenId].status = NFTStatus.PAUSED;
    uint256 posOld = nftLending[_tokenId].pos;

    uint256 replaceTokenId = nrNftsListed;
    nftLending[replaceTokenId].pos = posOld;
    nftsListed[posOld] = replaceTokenId;

    nftsListed.pop();
    nrNftsListed--;

  }

  function borrowNft(uint256 _tokenId, uint256 duration) external payable {
    NFTLending memory nft = nftLending[_tokenId];


    require(nft.owner != msg.sender, "OWNER_OF_THE_NFT");
    require(msg.value >= nft.cost * duration, "NOT_ENOUGH_ETH_SENT");

    _safeTransfer(_ownerOf(_tokenId),msg.sender,_tokenId,"0x");
    nftLending[_tokenId].status = NFTStatus.BORROWED;
    nftLending[_tokenId].borrower = msg.sender;
    nftLending[_tokenId].duration = duration * 60;

    nftLending[_tokenId].returnTaskId =_createReturnNftTaksk(_tokenId,nftLending[_tokenId].duration );
    (bool success, ) = payable(_ownerOf(_tokenId)).call{value: msg.value}("");
    require(success, "_transfer: ETH transfer failed");

    //update nft's by user lent
    LentByUser storage lentByUser = nftLentByUser[nft.owner];

    lentByUser.lents.push(_tokenId);
    lentByUser.nrLent++;


  }


  function getTokensLent(address lendner) view external returns(uint256){
    return nftLentByUser[lendner].nrLent;
  }

  function getTokensIdByPos(address lendner, uint256 pos) view external returns(uint256) {
    return nftLentByUser[lendner].lents[pos];
  }



  modifier onlyPaused(uint256 _tokenId) {
    require(
      nftLending[_tokenId].status == NFTStatus.PAUSED,
      "NFT_NOT_LISTING_READY"
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
    address from,
    address to,
    uint256 _tokenId,
    uint256 batchSize
  ) internal override {
    require(
      nftLending[_tokenId].status != NFTStatus.BORROWED,
      "NFT_IS_BORROWED"
    );

    nftLending[_tokenId].status = NFTStatus.PAUSED;
    super._beforeTokenTransfer(from, to, _tokenId, batchSize);
  }

  function safeMint(address to, bytes memory name) external {
    tokenId++;
    _safeMint(to, tokenId, "0x");
      nftLending[tokenId].id  = tokenId;
      nftLending[tokenId].name  = name;
  }

  // #endregion  ========== =============  ERC721  ============= ============= //

  // #region  ========== =============  GELATO OPS AUTOMATE CLOSING PROPOSAL  ============= ============= //

  //@dev creating the  gelato task
  function _createReturnNftTaksk(uint256 _tokenId, uint256 duration) internal returns (bytes32 taskId) {
    bytes memory timeArgs = abi.encode(
      uint128(block.timestamp + duration),
      duration
    );

    //@dev executing function encoded
    bytes memory execData = abi.encodeWithSelector(this.returnNft.selector,_tokenId);
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
   function returnNft(uint256 _tokenId) public onlyOps { 

    (uint256 fee, address feeToken) = IOps(ops).getFeeDetails();

    transfer(fee, feeToken);
    _returnNft(_tokenId);


   }


  function _returnNft(uint256 _tokenId) public  {
    nftLending[_tokenId].status = NFTStatus.LISTED;
    _safeTransfer(_ownerOf(_tokenId),nftLending[_tokenId].owner,_tokenId,"0x");


    //update nft's by user lent
    LentByUser storage lentByUser = nftLentByUser[nftLending[_tokenId].owner];

    uint256 foundIdPos;
    for (uint256 i=0;i<lentByUser.nrLent;i++){
      if(lentByUser.lents[i] == _tokenId){
          foundIdPos = i;
      }
    }

     nftLending[_tokenId].returnTaskId = bytes32(0);

    lentByUser.lents[foundIdPos] = lentByUser.lents[lentByUser.nrLent -1];
    lentByUser.lents.pop();
    lentByUser.nrLent--;
    
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

  receive() external payable {
    console.log("----- receive:", msg.value);
  }

  function withdraw() external onlyOwner returns (bool) {
    (bool result, ) = payable(msg.sender).call{value: address(this).balance}(
      ""
    );
    return result;
  }

    //Modifiers
  modifier onlyOwner() {
    require(msg.sender == owner, "ONLY_OWNER");
    _;
  }

}
