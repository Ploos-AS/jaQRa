# Cryptocurrency QR support (initial implementation)

jaQRa generates payment *payload text* locally. It does not connect to wallets, process payments, verify balances or request private keys/seed phrases.

| Type | Generated payload | Notes |
| --- | --- | --- |
| Bitcoin | `bitcoin:<address>?amount=<BTC>` | BIP21-style URI, optional BTC amount. |
| Monero | `monero:<address>?tx_amount=<XMR>` | Monero URI, optional XMR amount. Primary addresses and subaddresses supported by prefix/length screening. |
| Ethereum | `ethereum:<0x-address>` | Address-only. No EIP-681 transaction/amount support yet. |
| Lightning | `lightning:<BOLT11-invoice>` | Existing invoice only; jaQRa cannot issue invoices. |
| Solana | `solana:<address>` | Address-only URI; wallet compatibility varies. Solana Pay transactions are **not** implemented. |

**Limitations:** Initial address checks validate plausible characters and length only, not full network checksums, cryptographic key validity, or wallet acceptance. Lightning checks are superficial and do not decode or validate invoice signatures/checksums. Never rely on jaQRa to confirm that a destination is correct. Check the displayed address and amount in the receiving wallet before paying. Wallet support for URI schemes varies; test with your target wallet. Cryptocurrency QR payloads saved to My QR Library remain in local browser storage and are included in JSON backups.

Next steps: implement checksum-aware validation, complete BIP21/Monero URI compatibility tests, EIP-681 and Solana Pay, Lightning invoice decoding, and a categorized searchable QR type selector.
