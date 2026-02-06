import { describe, it, expect } from 'vitest';
import { DidPkhResolver } from '../resolvers/pkh';

describe('DidPkhResolver', () => {
  const resolver = new DidPkhResolver();

  it('resolves an Ethereum mainnet address', async () => {
    const did = 'did:pkh:eip155:1:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb';
    const result = await resolver.resolve(did);

    expect(result.didResolutionMetadata.error).toBeUndefined();
    expect(result.didDocument).not.toBeNull();
    expect(result.didDocument!.id).toBe(did);
    expect(result.didDocument!.verificationMethod).toHaveLength(1);
    expect(result.didDocument!.verificationMethod![0]!.type).toBe(
      'BlockchainVerificationMethod2021',
    );
    expect(result.didDocument!.verificationMethod![0]!.blockchainAccountId).toBe(
      'eip155:1:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb',
    );
    expect(result.didDocument!.authentication).toEqual([`${did}#blockchainAccountId`]);
    expect(result.didDocument!.assertionMethod).toEqual([`${did}#blockchainAccountId`]);
  });

  it('resolves a Polygon address', async () => {
    const did = 'did:pkh:eip155:137:0x1234567890abcdef1234567890abcdef12345678';
    const result = await resolver.resolve(did);

    expect(result.didResolutionMetadata.error).toBeUndefined();
    expect(result.didDocument!.verificationMethod![0]!.blockchainAccountId).toBe(
      'eip155:137:0x1234567890abcdef1234567890abcdef12345678',
    );
  });

  it('resolves a Solana address', async () => {
    const did = 'did:pkh:solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ';
    const result = await resolver.resolve(did);

    expect(result.didResolutionMetadata.error).toBeUndefined();
    expect(result.didDocument!.id).toBe(did);
    expect(result.didDocument!.verificationMethod![0]!.blockchainAccountId).toBe(
      'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    );
  });

  it('rejects non-did:pkh identifiers', async () => {
    const result = await resolver.resolve('did:web:example.com');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
  });

  it('rejects empty method-specific identifier', async () => {
    const result = await resolver.resolve('did:pkh:');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
  });

  it('rejects CAIP-10 with only namespace (no address)', async () => {
    const result = await resolver.resolve('did:pkh:eip155');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
    expect(result.didResolutionMetadata.message).toContain('CAIP-10');
  });

  it('rejects malformed CAIP-10 (empty namespace)', async () => {
    const result = await resolver.resolve('did:pkh::1:0xabc');
    expect(result.didDocument).toBeNull();
    expect(result.didResolutionMetadata.error).toBe('invalidDid');
  });
});
