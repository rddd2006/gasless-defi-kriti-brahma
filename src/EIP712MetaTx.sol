// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

abstract contract EIP712MetaTx {
    using ECDSA for bytes32;

    bytes32 private immutable DOMAIN_SEPARATOR;

    bytes32 internal constant TX_TYPEHASH =
        keccak256(
            "L2Tx(address from,address to,uint256 amount,uint256 nonce)"
        );

    constructor(string memory name, string memory version) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                block.chainid,
                address(this)
            )
        );
    }

    function _hashTypedData(
        address from,
        address to,
        uint256 amount,
        uint256 nonce
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(TX_TYPEHASH, from, to, amount, nonce)
        );

        return keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
    }
}