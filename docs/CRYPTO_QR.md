# Cryptocurrency QR support (initial implementation)

jaQRa generates payment *payload text* locally. It does not connect to wallets, process payments, verify balances or request private keys/seed phrases.

| Type | Generated payload | Notes |
| --- | --- | --- |
| Bitcoin | `bitcoin:<address>?amount=<BTC>` | BIP21-style URI, optional BTC amount. |
| Litecoin | `litecoin:<address>?amount=<LTC>` | Optional amount; address format screening only. |\n| Dogecoin | `dogecoin:<address>?amount=<DOGE>` | Optional amount; address format screening only. |\n| Bitcoin Cash | `bitcoincash:<cashaddr>?amount=<BCH>` | CashAddr only; optional amount; wallet support for amount parameter varies. |\n| Monero | `monero:<address>?tx_amount=<XMR>` | Monero URI, optional XMR amount. Primary addresses and subaddresses supported by prefix/length screening. |
| Ethereum | `ethereum:<0x-address>[@chainId]?value=<wei>` | EIP-681 native ETH transfer request; amount converted exactly from ETH to wei. Optional EVM chain ID. ERC-20/token transfers are not supported. |
| Lightning | `lightning:<BOLT11-invoice>` | Existing invoice only; jaQRa cannot issue invoices. |
| Solana | `solana:<address>?amount=<SOL>&label=...&message=...` | Solana Pay native SOL transfer request; optional amount, label and message. SPL token transfers and transaction-request links are not supported. |

**Limitations:** Initial address checks validate plausible characters and length only, not full network checksums, cryptographic key validity, or wallet acceptance. Lightning checks are superficial and do not decode or validate invoice signatures/checksums. Never rely on jaQRa to confirm that a destination is correct. Check the displayed address and amount in the receiving wallet before paying. Wallet support for URI schemes varies; test with your target wallet. Cryptocurrency QR payloads saved to My QR Library remain in local browser storage and are included in JSON backups.

Next steps: implement checksum-aware validation, complete BIP21/Monero URI compatibility tests, wallet interoperability tests, Lightning invoice decoding, and a categorized searchable QR type selector.

**Additional chain caution:** Address format screening is not checksum verification. In particular, BCH CashAddr checksum validation is not yet implemented, and legacy BCH addresses are intentionally not accepted to reduce cross-chain confusion. Always verify the destination and amount in a compatible wallet before payment.

**Amount handling:** ETH is converted to integer wei with BigInt (maximum 18 decimal places). SOL uses a decimal amount (maximum 9 decimal places). The optional Ethereum chain ID is not automatically verified against a wallet. Always confirm the selected chain, receiving address and amount in your wallet before authorizing a transfer.
