# Design patterns

## Inheritance and interfaces 

`FestivalTicket`inherits from the ERC-721 implementation of `OpenZeppelin`
`FestivalMarketToken`inherits from the ERC-20 implementation of `OpenZeppelin`

## Acces control design patterns 

`Ownable` is used in the `FestivalMarketPlace` so that the owner of the smart contract is the only one who can create a new festival. He can specify the festival organiser in the createFestival function.
