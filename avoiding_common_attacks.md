# Security measure

## SWC-103 Floating pragma

pragma `0.8.0` is used in all the contracts to avoid accidental bug inclusion through outdated compiler versions.

## SWC-115 Authorization through tx.origin

`tx.origin`is never used. Instead, we use `msg.sender`