// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract OptimisticRollup {

    using ECDSA for bytes32;

    /*//////////////////////////////////////////////////////////////
                               STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct L2Tx {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
    }

    struct Batch {
        bytes32 txRoot;
        bytes32 newStateRoot;
        uint256 timestamp;
        address relayer;
        bool finalized;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant CHALLENGE_WINDOW = 5 minutes;
    uint256 public constant RELAYER_BOND = 0.001 ether;

    bytes32 public immutable DOMAIN_SEPARATOR;

    bytes32 public constant TX_TYPEHASH =
        keccak256(
            "L2Tx(address from,address to,uint256 amount,uint256 nonce)"
        );

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    bytes32 public stateRoot;

    mapping(address => uint256) public bonded;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public nonces;

    Batch[] public batches;

    /*//////////////////////////////////////////////////////////////
                        GAS SPONSORSHIP STORAGE
    //////////////////////////////////////////////////////////////*/

    mapping(address => bool) public whitelistedTargets;

    mapping(address => uint256) public userSponsorshipCount;
    mapping(address => uint256) public lastReset;

    uint256 public constant DAILY_LIMIT = 5;
    uint256 public constant DAY = 1 days;

    address public owner;

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event BatchSubmitted(uint256 indexed batchId, bytes32 txRoot);
    event BatchFinalized(uint256 indexed batchId);
    event RelayerSlashed(address relayer);

    event SponsorshipUsed(address indexed user);
    event TargetWhitelisted(address target, bool status);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {

        owner = msg.sender;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("OptimisticRollup")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /*//////////////////////////////////////////////////////////////
                            ACCESS CONTROL
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               STAKING
    //////////////////////////////////////////////////////////////*/

    function stake() external payable {
        require(msg.value >= RELAYER_BOND, "Bond too low");
        bonded[msg.sender] += msg.value;
    }

    /*//////////////////////////////////////////////////////////////
                            USER DEPOSIT
    //////////////////////////////////////////////////////////////*/

    function deposit() external payable {

        balances[msg.sender] += msg.value;

        stateRoot = keccak256(
            abi.encodePacked(stateRoot, msg.sender, balances[msg.sender])
        );
    }

    /*//////////////////////////////////////////////////////////////
                       SPONSORSHIP POLICY
    //////////////////////////////////////////////////////////////*/

    function toggleWhitelist(address target, bool status)
        external
        onlyOwner
    {
        whitelistedTargets[target] = status;

        emit TargetWhitelisted(target, status);
    }

    function isEligibleForSponsorship(
        address user,
        address target
    ) public view returns (bool) {

        if (!whitelistedTargets[target]) {
            return false;
        }

        if (block.timestamp > lastReset[user] + DAY) {
            return true;
        }

        if (userSponsorshipCount[user] >= DAILY_LIMIT) {
            return false;
        }

        return true;
    }

    function recordSponsorship(address user) external {

        if (block.timestamp > lastReset[user] + DAY) {

            userSponsorshipCount[user] = 1;
            lastReset[user] = block.timestamp;

        } else {

            userSponsorshipCount[user] += 1;

        }

        emit SponsorshipUsed(user);
    }

    /*//////////////////////////////////////////////////////////////
                             BATCH SUBMISSION
    //////////////////////////////////////////////////////////////*/

    function submitBatch(
        bytes32 txRoot,
        bytes32 newStateRoot
    ) external {

        require(bonded[msg.sender] >= RELAYER_BOND, "Not bonded");

        batches.push(
            Batch({
                txRoot: txRoot,
                newStateRoot: newStateRoot,
                timestamp: block.timestamp,
                relayer: msg.sender,
                finalized: false
            })
        );

        emit BatchSubmitted(batches.length - 1, txRoot);
    }

    /*//////////////////////////////////////////////////////////////
                            FRAUD PROOF
    //////////////////////////////////////////////////////////////*/

    function challengeTx(
        uint256 batchId,
        L2Tx calldata txData,
        bytes calldata signature
    ) external {

        Batch storage batch = batches[batchId];

        require(
            block.timestamp <= batch.timestamp + CHALLENGE_WINDOW,
            "Window closed"
        );

        bytes32 digest = _hashTypedData(
            txData.from,
            txData.to,
            txData.amount,
            txData.nonce
        );

        address signer = digest.recover(signature);

        if (signer != txData.from) {

            bonded[batch.relayer] = 0;

            emit RelayerSlashed(batch.relayer);

            revert("Fraud: Invalid Signature");
        }
    }

    /*//////////////////////////////////////////////////////////////
                            FINALIZATION
    //////////////////////////////////////////////////////////////*/

    function finalizeBatch(uint256 batchId) external {

        Batch storage batch = batches[batchId];

        require(!batch.finalized, "Already finalized");

        require(
            block.timestamp > batch.timestamp + CHALLENGE_WINDOW,
            "Too early"
        );

        stateRoot = batch.newStateRoot;

        batch.finalized = true;

        emit BatchFinalized(batchId);
    }

    /*//////////////////////////////////////////////////////////////
                            EIP712 HASH
    //////////////////////////////////////////////////////////////*/

    function _hashTypedData(
        address from,
        address to,
        uint256 amount,
        uint256 nonce
    ) internal view returns (bytes32) {

        bytes32 structHash = keccak256(
            abi.encode(
                TX_TYPEHASH,
                from,
                to,
                amount,
                nonce
            )
        );

        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
    }
}