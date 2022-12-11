//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import {IOps} from "./gelato/IOps.sol";
import {LibDataTypes} from "./gelato/LibDataTypes.sol";

contract FanToEarn {
  //// GELATO
  IOps public ops;
  address payable public gelato;
  address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  bytes32 public finishingVotingTask;

  constructor(IOps _ops) {
    ops = _ops;
  }

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
  function finishVoting() public onlyOps {
 
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
