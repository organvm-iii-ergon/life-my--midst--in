import { describe, it, expect } from 'vitest';
import { DidKeyResolver } from '../resolvers/key';
import * as jose from 'jose';

describe('DidKeyResolver', () => {
  const resolver = new DidKeyResolver();

  it('resolves a valid did:key with Ed25519 public key', async () => {
    // Generate a real Ed25519 key pair, encode as proper did:key
    const { publicKey } = await jose.generateKeyPair('EdDSA', { extractable: true });
    const jwk = await jose.exportJWK(publicKey);
    // Raw public key is the base64url-decoded 'x' parameter
    const rawBytes = Buffer.from(jwk['x'] as string, 'base64url');

    const { base58btc } = await import('multiformats/bases/base58');
    const multicodecKey = new Uint8Array([0xed, 0x01, ...rawBytes]);
    const multibaseValue = base58btc.encode(multicodecKey);
    const did = `did:key:${multibaseValue}`;

    const result = await resolver.resolve(did);

    expect(result.didResolutionMetadata.error).toBeUndefined();
    expect(result.didDocument).not.toBeNull();
    expect(result.didDocument!.id).toBe(did);
    expect(result.didDocument!.verificationMethod).toHaveLength(1);
    expect(result.didDocument!.verificationMethod![0]!.type).toBe('Ed25519VerificationKey2020');
    expect(result.didDocument!.verificationMethod![0]!.publicKeyMultibase).toBe(multibaseValue);
    expect(result.didDocument!.authentication).toEqual([`${did}#${multibaseValue}`]);
    expect(result.didDocument!.assertionMethod).toEqual([`${did}#${multibaseValue}`]);
  });

  it('rejects non-did:key identifiers', async () => {
    const result = await resolver.resolve('did:web:example.com');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
  });

  it('rejects empty method-specific identifier', async () => {
    const result = await resolver.resolve('did:key:');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
  });

  it('rejects non-base58btc multibase prefix', async () => {
    const result = await resolver.resolve('did:key:f01234567');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
    expect(result.didResolutionMetadata.message).toContain("Expected 'z' (base58btc)");
  });

  it('rejects invalid multicodec prefix', async () => {
    const { base58btc } = await import('multiformats/bases/base58');
    // Use wrong prefix bytes (0x00 0x00 instead of 0xed 0x01)
    const badBytes = new Uint8Array([0x00, 0x00, ...new Uint8Array(32)]);
    const encoded = base58btc.encode(badBytes);
    const result = await resolver.resolve(`did:key:${encoded}`);

    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
    expect(result.didResolutionMetadata.message).toContain('Ed25519 (0xed01)');
  });

  it('rejects wrong key length', async () => {
    const { base58btc } = await import('multiformats/bases/base58');
    // Correct prefix but only 16 bytes of key instead of 32
    const shortKey = new Uint8Array([0xed, 0x01, ...new Uint8Array(16)]);
    const encoded = base58btc.encode(shortKey);
    const result = await resolver.resolve(`did:key:${encoded}`);

    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
    expect(result.didResolutionMetadata.message).toContain('expected 32 bytes');
  });

  it('round-trips: generated key resolves successfully', async () => {
    const { publicKey } = await jose.generateKeyPair('EdDSA', { extractable: true });
    const jwk = await jose.exportJWK(publicKey);
    const rawBytes = Buffer.from(jwk['x'] as string, 'base64url');
    const { base58btc } = await import('multiformats/bases/base58');
    const encoded = base58btc.encode(new Uint8Array([0xed, 0x01, ...rawBytes]));
    const did = `did:key:${encoded}`;

    const result = await resolver.resolve(did);
    expect(result.didDocument).not.toBeNull();

    // The multibase value in the verification method should round-trip to the original
    const vmMultibase = result.didDocument!.verificationMethod![0]!.publicKeyMultibase!;
    const decoded = base58btc.decode(vmMultibase);
    const recoveredKey = decoded.slice(2); // strip 0xed 0x01
    expect(Buffer.from(recoveredKey).toString('base64url')).toBe(jwk['x']);
  });
});
