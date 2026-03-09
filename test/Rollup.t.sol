// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OptimisticRollup.sol";

contract RollupTest is Test {

    OptimisticRollup roll;

    address relayer = address(100);

    function setUp() public {
        roll = new OptimisticRollup();
    }

    /* ---------------------------------------------------------- */
    /*                     BASIC GAS TESTS                        */
    /* ---------------------------------------------------------- */

    function testGasDirectDeposit() public {
        roll.deposit{value: 1 ether}();
    }

   function testSubmitBatchGas() public {

    vm.deal(relayer, 1 ether);

    vm.prank(relayer);
    roll.stake{value: 0.001 ether}();

    vm.prank(relayer);
    roll.submitBatch(bytes32(0), bytes32(0), "");
}

    /* ---------------------------------------------------------- */
    /*                 IMPROVED COMPARISON TESTS                  */
    /* ---------------------------------------------------------- */

    function testFiveDirectDepositsGas() public {

        for (uint i = 0; i < 5; i++) {

            address user = address(uint160(i + 1));

            vm.deal(user, 1 ether);

            vm.prank(user);

            roll.deposit{value: 1 ether}();
        }
    }

    function testBatchExecutionGas() public {

        bytes32 dummyRoot = keccak256("root");
        bytes32 newState = keccak256("state");

        vm.deal(relayer, 1 ether);

        vm.prank(relayer);
        roll.stake{value: 0.001 ether}();

        vm.prank(relayer);
        roll.submitBatch(dummyRoot, newState, "");
    }
}