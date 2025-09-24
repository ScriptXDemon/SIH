// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TouristID {
    struct Tourist {
        bytes32 dataHash; // A single hash of all personal data
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    mapping(address => Tourist) private tourists;

    event TouristRegistered(address indexed wallet, bytes32 dataHash, uint256 startDate, uint256 endDate);
    event TouristExpired(address indexed wallet);

    modifier onlyActive(address _wallet) {
        require(tourists[_wallet].isActive, "Tourist pass expired or not found");
        require(block.timestamp <= tourists[_wallet].endDate, "Tourist pass has expired");
        _;
    }

    /**
     * @dev Registers a new tourist by storing a hash of their personal data.
     * @param _wallet The tourist's wallet address.
     * @param _dataHash A Keccak256 hash of the concatenated tourist information.
     * @param _startDate The start date of the tourist pass (Unix timestamp).
     * @param _endDate The end date of the tourist pass (Unix timestamp).
     */
    function registerTourist(
        address _wallet,
        bytes32 _dataHash,
        uint256 _startDate,
        uint256 _endDate
    ) public {
    
        require(_endDate > _startDate, "End date must be after start date");

        tourists[_wallet] = Tourist({
            dataHash: _dataHash,
            startDate: _startDate,
            endDate: _endDate,
            isActive: true
        });

        emit TouristRegistered(_wallet, _dataHash, _startDate, _endDate);
    }

    function getTourist(address _wallet) public view onlyActive(_wallet) returns (Tourist memory) {
        return tourists[_wallet];
    }

    function expireTourist(address _wallet) public {
        if (block.timestamp > tourists[_wallet].endDate) {
            tourists[_wallet].isActive = false;
            emit TouristExpired(_wallet);
        }
    }
}
