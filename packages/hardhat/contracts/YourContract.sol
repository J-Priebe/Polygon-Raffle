pragma solidity ^0.8.0;


import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC721/ERC721.sol";
import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC721/IERC721Receiver.sol";

import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/utils/Counters.sol";


import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/proxy/Clones.sol";
import "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/proxy/utils/Initializable.sol";

import "smartcontractkit/chainlink@0.10.4/contracts/src/v0.6/VRFConsumerBase.sol";


// Chainlink scratch
contract RandomGenerator is VRFConsumerBase {

    uint256 public randomResult;

    constructor(
        address _vrfCoordinator, 
        address _link
    ) VRFConsumerBase(_vrfCoordinator, _link) public {
    }

    /** 
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }
}


// https://eips.ethereum.org/EIPS/eip-721
contract RaffleTicket is ERC721 {
    event minted(uint mintedNum, address buyer);

    constructor() ERC721("RaffleTicket", "TIX") {}

    // This contract does not control the supply.
    // Only the minter (the raffle contract) should be able to call this.
    // need to add access control/minter role
    function sendTicket(address buyer, uint ticketNum) public { 
        _mint(buyer, ticketNum);
        emit minted(ticketNum, buyer);
    }
}

contract Raffle2 is Initializable, IERC721Receiver {
    RaffleTicket public ticketMaker;
    uint public numInitialTickets;
    uint public ticketPrice;
    uint public numTicketsSold;

    uint256 public prizeTokenId;
    address public prizeAddress;

    address public manager;
    address public benefactor;
    address public donor;

    event nftReceived(string msg);

    function getTicketOwner(uint256 ticketId) public view returns (address) {
        return ticketMaker.ownerOf(ticketId);
    }

    function initialize(
        uint  initialNumTickets, 
        uint  initialTicketPrice,
        address manager,
        address benefactor
    ) public {
        manager = manager;
        benefactor = benefactor;

        ticketMaker = new RaffleTicket();
        
        numInitialTickets = initialNumTickets;
        ticketPrice = initialTicketPrice;
        numTicketsSold = 0;

        // TODO figure out if it's possible to approve and transfer
        // prize NFT in the init call, or at least through the Raffle interface
        // ERC721(prizeAddress).safeTransferFrom(
        //     msg.sender,
        //     address(this),
        //     prizeTokenId
        // );
    }

    function sendAvailableTicket(address sender) private {
        // juuust in case require here too
        require(numTicketsSold < numInitialTickets);

        // ID of the NFT is the # of the sold ticket, starting with 0
        ticketMaker.sendTicket(sender, numTicketsSold);
        numTicketsSold ++;
    }

    // To be replaced with chainlink
    function dangerousPseudoRandom() private view returns (uint) {
        // NOTE: this is theoretically gameable, 
        // all of the inputs are public
        // if you can predict the time at which it will be executed
        // TLDR this is a toy only
        // look into chainlink VRF for true randomness
        //https://docs.chain.link/docs/get-a-random-number
        return uint(keccak256(abi.encodePacked(
            block.difficulty,
            block.timestamp
        )));
    }

    function enter() public payable {
        uint numTickets = msg.value / ticketPrice;
        
        require(
            (numInitialTickets - numTicketsSold) >= numTickets, 
            "No more tickets available"
        );

        for (uint i=0; i < numTickets; i++) {
            sendAvailableTicket(msg.sender);
        }
    }


    function drawWinner() public managerOnly {
        // winner can't be an unsold ticket
        uint winningTicketIndex = dangerousPseudoRandom() % numTicketsSold;
        // charity gets the prize moneys
        benefactor.send(this.value)

        // owner of the winning ticket gets the prize NFT
        address winner = ticketMaker.ownerOf(winningTicketIndex);

        ERC721(prizeAddress).safeTransferFrom(
            address(this),
            winner,
            prizeTokenId
        );
    }

    // Not perfect, ideally we can receive the NFT in the same step as initializing
    // the contract, or *at least* through an interface that lives on the raffle itself.
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) public override returns (bytes4) {
        emit nftReceived("");

        // kinda janky, decline any tokens past the first one donated
        require(prizeAddress == address(0), "Already have a prize");

        donor = from;

        // now our prize can be uniquely identified
        // regardless of which "collection" it belongs to
        prizeAddress = msg.sender;
        prizeTokenId = tokenId;
        return this.onERC721Received.selector;
    }

    modifier managerOnly() {
        require(msg.sender == manager, 'This action can only be performed by contract manager.');
        _;
    }}
}


contract RaffleFactory {
    address immutable raffleImplementation;

    constructor() {
        raffleImplementation = address(new Raffle2());
    }

    function createRaffle(
        uint  initialNumTickets, 
        uint  initialTicketPrice,
        address benefactor,
    ) external returns (address) {
        address clone = Clones.clone(raffleImplementation);
        Raffle2(clone).initialize(
            initialNumTickets, 
            initialTicketPrice,
            msg.sender,
            benefactor
        );

        return clone;
    }
}
