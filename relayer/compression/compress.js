import { ethers } from "ethers";

/*
Simple calldata compression
Pack transactions into a single byte array
*/

export function compressBatch(txs) {

    const packed = txs.map(tx => {

        return ethers.solidityPacked(
            ["address","address","uint256","uint256"],
            [
                tx.from,
                tx.to,
                tx.amount,
                tx.nonce
            ]
        );

    });

    return ethers.concat(packed);
}