pragma solidity ^0.6.7;


import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./RaffleTicket.sol";

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";


contract Raffle is Initializable, IERC721Receiver, VRFConsumerBase {
    RaffleTicket public ticketMaker;
    uint public numInitialTickets;
    uint public ticketPrice;
    uint public numTicketsSold;

    uint256 public prizeTokenId;
    address public prizeAddress;

    address public manager;
    address payable public benefactor;
    string public benefactorName;

    address public donor;

    address public winner;
    // should we include a donor moniker too? I feel like
    // that should be part of the NFT metadata spec...

    event nftReceived(string msg);

    // CHAINLINK
    bytes32 keyHash;
    uint256 fee;

    // set true while we are awaiting randomness from the oracle
    bool private drawInProgress;

    uint256 public randomResult;

    // hash, coordinator and token addresses depend on
    // our network. i.e., mumbai testnet
    // coinrdator: address of smart contract which verifies our result
    constructor(
        address _vrfCoordinator,
        address _link
    ) VRFConsumerBase(_vrfCoordinator, _link) public {
        // do I do this in init instead?
        // I think you can leave in constructor
        // as it applies to all instances of this contract
        keyHash = 0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da;
        fee = 0.0001 * 10 ** 18; // 0.1 LINK
    }


    // step 1
    // manager calls the draw
    function drawWinner() public managerOnly {
        require(!drawInProgress, "draw is already in progress");
        require(winner == address(0), "winner already picked");

        uint seed = getRandomnessSeed();
        // ask chainlink for a random number
        getRandomNumber(seed);
    }

    // step 2
    // initiated when raffle calls draw
    function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        drawInProgress = true;
        // You could use the request ID if you have multiple
        // randomness requests in a given contract, but we do not
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    // step 3 (called by the coordinator)
    // finalizes the lottery (selects winner based off random value)
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        declareWinner();
        drawInProgress = false;
    }

    // step 4
    function declareWinner() private {
        // use our random number to select a winner
        // from the pool of sold tickets
        uint winningTicketIndex = randomResult % numTicketsSold;
        
        // benefactor gets the ticket revenue
        benefactor.call{value:address(this).balance}('');

        // owner of the winning ticket gets the prize NFT
        winner = ticketMaker.ownerOf(winningTicketIndex);
        ERC721(prizeAddress).safeTransferFrom(
            address(this),
            winner,
            prizeTokenId
        );
    }


    function getRandomnessSeed() private view returns (uint) {
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



    function getTicketOwner(uint256 ticketId) public view returns (address) {
        return ticketMaker.ownerOf(ticketId);
    }

    function getTicketBalance(address addr) public view returns (uint256) {
        return ticketMaker.balanceOf(addr);
    }

    // NOTE: Assumes prize contract includes metadata extension
    function getPrizeURI() public view returns (string memory) {
        if (prizeAddress == address(0)) {
            return '';
        }

        // Can we catch the fact that extension is not implemented
        // and return a placeholder?
        return ERC721(prizeAddress).tokenURI(prizeTokenId);
    }

    function initialize(
        uint  initialNumTickets, 
        uint  initialTicketPrice,
        address raffleManager,
        address payable raffleBenefactor,
        string memory raffleBenefactorName
    ) public {
        manager = raffleManager;
        benefactor = raffleBenefactor;
        benefactorName = raffleBenefactorName;

        ticketMaker = new RaffleTicket();
        
        numInitialTickets = initialNumTickets;
        ticketPrice = initialTicketPrice;
        numTicketsSold = 0;

        drawInProgress = false;

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

    // Not perfect, ideally we can receive the NFT in the same step as initializing
    // the contract, or *at least* through an interface that lives on the raffle itself.
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public override returns (bytes4) {
        emit nftReceived("PRIZE RECEIVED");

        // kinda janky, decline any tokens past the first one donated
        // require(false); //prizeAddress == address(0), "Already have a prize");

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
    }
}