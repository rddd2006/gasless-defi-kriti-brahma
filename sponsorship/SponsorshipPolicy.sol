// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SponsorshipPolicy {

    mapping(address => bool) public whitelistedTargets;

    mapping(address => uint256) public sponsorshipCount;
    mapping(address => uint256) public lastReset;

    uint256 public constant DAILY_LIMIT = 5;
    uint256 public constant DAY = 1 days;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function toggleWhitelist(address target, bool status) external onlyOwner {
        whitelistedTargets[target] = status;
    }

    function isEligibleForSponsorship(
        address user,
        address target
    ) public view returns (bool) {

        if (!whitelistedTargets[target]) return false;

        if (block.timestamp > lastReset[user] + DAY) {
            return true;
        }

        if (sponsorshipCount[user] >= DAILY_LIMIT) {
            return false;
        }

        return true;
    }

    function recordSponsorship(address user) external {

        if (block.timestamp > lastReset[user] + DAY) {
            sponsorshipCount[user] = 1;
            lastReset[user] = block.timestamp;
        } else {
            sponsorshipCount[user] += 1;
        }
    }
}