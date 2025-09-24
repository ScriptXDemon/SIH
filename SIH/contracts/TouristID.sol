// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TouristID {
    struct Tourist {
        string name;
        string nationality;
        string passportOrAadhaar;
        string itinerary;
        string emergencyContact;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    mapping(address => Tourist) private tourists;

    event TouristRegistered(address indexed wallet, string name, uint256 startDate, uint256 endDate);
    event TouristExpired(address indexed wallet);

    modifier onlyActive(address _wallet) {
        require(tourists[_wallet].isActive, "Tourist pass expired or not found");
        require(block.timestamp <= tourists[_wallet].endDate, "Tourist pass has expired");
        _;
    }

    function registerTourist(
        address _wallet,
        string memory _name,
        string memory _nationality,
        string memory _passportOrAadhaar,
        string memory _itinerary,
        string memory _emergencyContact,
        uint256 _startDate,
        uint256 _endDate
    ) public {
        require(_endDate > _startDate, "End date must be after start date");

        tourists[_wallet] = Tourist({
            name: _name,
            nationality: _nationality,
            passportOrAadhaar: _passportOrAadhaar,
            itinerary: _itinerary,
            emergencyContact: _emergencyContact,
            startDate: _startDate,
            endDate: _endDate,
            isActive: true
        });

        emit TouristRegistered(_wallet, _name, _startDate, _endDate);
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
