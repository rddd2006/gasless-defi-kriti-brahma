// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library MerkleLib {

    function verify(
        bytes32 leaf,
        bytes32[] memory proof,
        bytes32 root
    ) internal pure returns (bool) {

        bytes32 hash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 p = proof[i];

            if (hash < p) {
                hash = keccak256(abi.encodePacked(hash, p));
            } else {
                hash = keccak256(abi.encodePacked(p, hash));
            }
        }

        return hash == root;
    }
}