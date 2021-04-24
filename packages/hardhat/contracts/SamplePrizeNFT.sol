pragma solidity ^0.6.7;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// ERC721 includes IERC721Metadata extension so we can do things like
// call tokenURI
contract SamplePrizeNFT is ERC721 {
    event sendingTestPrize(string msg, address recipient);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() public ERC721("Prize", "PRZ") {}

    // TokenURI should point to a JSON server with metadata, inc. hosted file URL
    function sendPrize(address addr, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        emit sendingTestPrize("sending Prize to", addr);
        uint256 newPrizeId = _tokenIds.current();
        _safeMint(addr, newPrizeId);
        _setTokenURI(newPrizeId, tokenURI);

        return newPrizeId;
    }
}
