# Security measure

## SWC-103 Floating pragma

pragma `0.8.0` is used in all the contracts to avoid accidental bug inclusion through outdated compiler versions.

## SWC-115 Authorization through tx.origin

`tx.origin`is never used. Instead, we use `msg.sender`

## Modifiers used only for validation

## SWC-136 Unencrypted Private Data On-Chain

There is no unencrypted private data on-chain in this project.