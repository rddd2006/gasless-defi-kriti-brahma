// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OptimisticRollup.sol";

contract RollupTest is Test {

    OptimisticRollup roll;

    function setUp() public {
        roll = new OptimisticRollup();
    }

    function testGasDirectDeposit() public {
        roll.deposit{value: 1 ether}();
    }

    function testSubmitBatchGas() public {
        roll.stake{value: 1 ether}();
        roll.submitBatch(bytes32(0), bytes32(0));
    }
}