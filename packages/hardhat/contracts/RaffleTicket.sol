
pragma solidity ^0.6.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


// https://eips.ethereum.org/EIPS/eip-721
contract RaffleTicket is ERC721 {
    event minted(uint mintedNum, address buyer);

    constructor() ERC721("RaffleTicket", "TIX") public {}

    // This contract does not control the supply.
    // Only the minter (the raffle contract) should be able to call this.
    // need to add access control/minter role
    function sendTicket(address buyer, uint ticketNum, string memory ticketURI) public { 
        _safeMint(buyer, ticketNum);
        _setTokenURI(ticketNum, ticketURI);
        emit minted(ticketNum, buyer);
    }
}