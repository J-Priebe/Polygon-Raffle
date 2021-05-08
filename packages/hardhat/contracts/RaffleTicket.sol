
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

    // Inspired by cryptokitties and this stackoverflow:
    // https://ethereum.stackexchange.com/questions/54959/list-erc721-tokens-owned-by-a-user-on-a-web-page
    
    // Expensive and ONLY CALLABLE EXTERNALLY because it
    // returns a dynamic array. 
    function tokensOfOwner(address _owner) external view returns(uint256[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 total = totalSupply(); // is this custom? do i need a counter?
            uint256 resultIndex = 0;

            // Tickets are generated sequentially, starting at 0
            uint256 ticketId;

            for (ticketId = 0; ticketId < total; ticketId++) {
                if (ownerOf(ticketId) == _owner) {
                    result[resultIndex] = ticketId;
                    resultIndex++;
                }
            }

            return result;
        }
    }

}