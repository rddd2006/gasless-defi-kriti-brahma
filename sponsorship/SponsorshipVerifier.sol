// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SponsorshipVerifier {

    using ECDSA for bytes32;

    address public paymaster;

    constructor(address _paymaster) {
        paymaster = _paymaster;
    }

    function verifySponsorSignature(
        bytes32 messageHash,
        bytes calldata signature
    ) public view returns (bool) {

        address recovered = messageHash.toEthSignedMessageHash().recover(signature);

        return recovered == paymaster;
    }
}