/**
 * did:pkh DID Method Resolver
 *
 * Resolves `did:pkh:<CAIP-10 account ID>` identifiers by parsing the
 * blockchain account ID and constructing a DID Document.
 *
 * Format: did:pkh:<namespace>:<chain_reference>:<account_address>
 * Examples:
 *   did:pkh:eip155:1:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb
 *   did:pkh:solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ
 *
 * The DID document is deterministic from the address — no on-chain lookup needed.
 * Uses BlockchainVerificationMethod2021 with a CAIP-10 blockchainAccountId.
 *
 * @see https://github.com/w3c-ccg/did-pkh/blob/main/did-pkh-method-draft.md
 */

import type { DIDDocument, DIDResolutionResult } from '../registry';

/**
 * Validate a CAIP-10 account ID structure.
 * Supports both 3-part (namespace:reference:address) for EVM chains
 * and 2-part (namespace:address) for chains like Solana.
 */
function parseCaip10(accountId: string): {
  namespace: string;
  rest: string;
} | null {
  const colonIdx = accountId.indexOf(':');
  if (colonIdx < 1) return null;

  const namespace = accountId.slice(0, colonIdx);
  const rest = accountId.slice(colonIdx + 1);

  if (!namespace || !rest) return null;

  return { namespace, rest };
}

export class DidPkhResolver {
  resolve(did: string): Promise<DIDResolutionResult> {
    if (!did.startsWith('did:pkh:')) {
      return Promise.resolve(this.errorResult('invalidDid', `Not a did:pkh identifier: ${did}`));
    }

    const methodSpecific = did.slice('did:pkh:'.length);
    if (!methodSpecific) {
      return Promise.resolve(this.errorResult('invalidDid', 'Empty method-specific identifier'));
    }

    const caip10 = parseCaip10(methodSpecific);
    if (!caip10) {
      return Promise.resolve(
        this.errorResult(
          'invalidDid',
          `Invalid CAIP-10 account ID: ${methodSpecific}. Expected format: <namespace>:<reference>:<address> or <namespace>:<address>`,
        ),
      );
    }

    const blockchainAccountId = methodSpecific;
    const keyId = `${did}#blockchainAccountId`;

    const document: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/blockchain-2021/v1',
      ],
      id: did,
      verificationMethod: [
        {
          id: keyId,
          type: 'BlockchainVerificationMethod2021',
          controller: did,
          blockchainAccountId,
        },
      ],
      authentication: [keyId],
      assertionMethod: [keyId],
    };

    return Promise.resolve({
      didDocument: document,
      didDocumentMetadata: {},
      didResolutionMetadata: {},
    });
  }

  private errorResult(error: string, message: string): DIDResolutionResult {
    return {
      didDocument: null,
      didDocumentMetadata: {},
      didResolutionMetadata: { error, message },
    };
  }
}
