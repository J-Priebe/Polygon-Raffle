pragma solidity ^0.6.7;

import "@openzeppelin/contracts/proxy/Clones.sol";

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

import "./Raffle.sol";


contract RaffleFactory {
    address immutable raffleImplementation;

    address[] public raffles;

    constructor() public {
        // Mumbai testnet chainlink coordinator and token
        // contract addresses
        raffleImplementation = address(new Raffle(
            0x3d2341ADb2D31f1c5530cDC622016af293177AE0,
            0xb0897686c545045aFc77CF20eC7A532E3120E0F1
        ));
    }

    function createRaffle(
        uint256 initialNumTickets,
        uint256 initialTicketPrice,
        address payable benefactor,
        string calldata benefactorName
    ) external returns (address) {
        address clone = Clones.clone(raffleImplementation);
        Raffle(clone).initialize(
            initialNumTickets,
            initialTicketPrice,
            msg.sender,
            benefactor,
            benefactorName
        );

        raffles.push(clone);

        return clone;
    }

    // return the whole array
    function getAllRaffles() public view returns (address[] memory) {
        return raffles;
    }

    // raffles managed by the caller, including
    // ones with no prize set yet, etc.
    // maybe just make manager a param so you can use local/read-only providers
    function getManagedRaffles() public view returns (address[] memory) {
        // We're using raffles.length as an upper bound on the size of the array
        // because you can't use dynamic or storage arrays in a view.
        // This means the client will need to filter out 0-Address entries.
        address[] memory managed = new address[](raffles.length);
        uint256 counter = 0;

        for (uint256 i = 0; i < raffles.length; i++) {
            Raffle r = Raffle(raffles[i]);
            address raffleManager = r.manager();
            if (raffleManager == msg.sender) {
                managed[counter] = raffles[i];
                counter++;
            }
        }
        return managed;
    }

    // raffles that have a prize but no winner yet
    // We hide raffles without a prize set outside manager scope
    function getActiveRaffles() public view returns (address[] memory) {
        address[] memory active = new address[](raffles.length);
        uint256 counter = 0;

        for (uint256 i = 0; i < raffles.length; i++) {
            Raffle r = Raffle(raffles[i]);
            if (r.prizeAddress() != address(0) && r.winner() == address(0)) {
                active[counter] = raffles[i];
                counter++;
            }
        }
        return active;
    }

    // raffles that have a winner
    // what about expired raffles that nobody bought tickets for?
    function getCompletedRaffles() public view returns (address[] memory) {
        address[] memory completed = new address[](raffles.length);
        uint256 counter = 0;
        for (uint256 i = 0; i < raffles.length; i++) {
            Raffle r = Raffle(raffles[i]);
            if (r.winner() != address(0)) {
                completed[counter] = raffles[i];
                counter++;
            }
        }
        return completed;
    }
}
