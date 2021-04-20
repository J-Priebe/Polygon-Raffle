pragma solidity ^0.6.7;

import "@openzeppelin/contracts/proxy/Clones.sol";

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

import "./Raffle.sol";

// // Chainlink scratch
// contract RandomGenerator is VRFConsumerBase {

//     uint256 public randomResult;

//     constructor(
//         address _vrfCoordinator, 
//         address _link
//     ) VRFConsumerBase(_vrfCoordinator, _link) public {
//     }

//     /** 
//      * Requests randomness from a user-provided seed
//      */
//     function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
//         require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
//         return requestRandomness(keyHash, fee, userProvidedSeed);
//     }

//     /**
//      * Callback function used by VRF Coordinator
//      */
//     function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
//         randomResult = randomness;
//     }
// }



contract RaffleFactory {
    address immutable raffleImplementation;

    constructor() public {
        raffleImplementation = address(new Raffle());
    }

    function createRaffle(
        uint  initialNumTickets, 
        uint  initialTicketPrice,
        address payable benefactor
    ) external returns (address) {
        address clone = Clones.clone(raffleImplementation);
        Raffle(clone).initialize(
            initialNumTickets, 
            initialTicketPrice,
            msg.sender,
            benefactor
        );

        return clone;
    }
}
