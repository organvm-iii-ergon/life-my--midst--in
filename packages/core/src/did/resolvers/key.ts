/**
 * did:key DID Method Resolver
 *
 * Resolves `did:key:z6Mk...` identifiers by decoding the multibase+multicodec
 * encoded Ed25519 public key and constructing a DID Document.
 *
 * Format: did:key:<multibase-encoded-multicodec-public-key>
 * - Multibase prefix 'z' = base58btc
 * - Multicodec prefix 0xed 0x01 = Ed25519 public key
 * - Followed by 32 bytes of raw Ed25519 public key
 *
 * No network I/O required — the DID document is deterministic.
 *
 * @see https://w3c-ccg.github.io/did-method-key/
 */

import type { DIDDocument, DIDResolutionResult } from '../registry';

/** Ed25519 multicodec prefix bytes */
const ED25519_CODEC = new Uint8Array([0xed, 0x01]);

/** Expected length of raw Ed25519 public key in bytes */
const ED25519_KEY_LENGTH = 32;

export class DidKeyResolver {
  /**
   * Resolve a did:key identifier to a DID Document.
   */
  async resolve(did: string): Promise<DIDResolutionResult> {
    if (!did.startsWith('did:key:')) {
      return this.errorResult('invalidDid', `Not a did:key identifier: ${did}`);
    }

    const multibaseValue = did.slice('did:key:'.length);
    if (!multibaseValue) {
      return this.errorResult('invalidDid', 'Empty method-specific identifier');
    }

    // Multibase prefix 'z' means base58btc encoding
    if (!multibaseValue.startsWith('z')) {
      return this.errorResult(
        'invalidDid',
        `Unsupported multibase prefix: ${multibaseValue[0]}. Expected 'z' (base58btc)`,
      );
    }

    try {
      const { base58btc } = await import('multiformats/bases/base58');
      const decoded = base58btc.decode(multibaseValue);

      // Verify Ed25519 multicodec prefix (0xed 0x01)
      if (
        decoded.length < ED25519_CODEC.length ||
        decoded[0] !== ED25519_CODEC[0] ||
        decoded[1] !== ED25519_CODEC[1]
      ) {
        return this.errorResult(
          'invalidDid',
          'Invalid multicodec prefix. Expected Ed25519 (0xed01)',
        );
      }

      const rawPublicKey = decoded.slice(ED25519_CODEC.length);
      if (rawPublicKey.length !== ED25519_KEY_LENGTH) {
        return this.errorResult(
          'invalidDid',
          `Invalid Ed25519 key length: expected ${ED25519_KEY_LENGTH} bytes, got ${rawPublicKey.length}`,
        );
      }

      // Build the DID Document with Ed25519VerificationKey2020
      const keyId = `${did}#${multibaseValue}`;
      const document: DIDDocument = {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1',
        ],
        id: did,
        verificationMethod: [
          {
            id: keyId,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: multibaseValue,
          },
        ],
        authentication: [keyId],
        assertionMethod: [keyId],
        // Ed25519 keys can be converted to X25519 for key agreement,
        // but we don't do that conversion here for simplicity
      };

      return {
        didDocument: document,
        didDocumentMetadata: {},
        didResolutionMetadata: {},
      };
    } catch (err) {
      if (
        (err as Error).message?.includes('multicodec') ||
        (err as Error).message?.includes('Ed25519')
      ) {
        return this.errorResult('invalidDid', (err as Error).message);
      }
      return this.errorResult(
        'invalidDid',
        `Failed to decode did:key: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private errorResult(error: string, message: string): DIDResolutionResult {
    return {
      didDocument: null,
      didDocumentMetadata: {},
      didResolutionMetadata: { error, message },
    };
  }
}
