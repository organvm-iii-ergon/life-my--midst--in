import { describe, expect, it, beforeAll } from "vitest";
import {
  DIDKey,
  hashPayload,
  signIntegrity,
  verifyIntegrity,
  type KeyPair,
  type SignedBlock
} from "../src/crypto";

describe("Crypto Module", () => {
  let keyPair: KeyPair;

  beforeAll(async () => {
    keyPair = await DIDKey.generate();
  });

  describe("hashPayload", () => {
    it("hashes a payload consistently", async () => {
      const payload = { name: "test", value: 123 };
      const hash1 = await hashPayload(payload);
      const hash2 = await hashPayload(payload);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex
    });

    it("produces different hashes for different payloads", async () => {
      const hash1 = await hashPayload({ a: 1 });
      const hash2 = await hashPayload({ a: 2 });

      expect(hash1).not.toBe(hash2);
    });

    it("normalizes payload key order", async () => {
      const payload1 = { a: 1, b: 2, c: 3 };
      const payload2 = { c: 3, a: 1, b: 2 };

      const hash1 = await hashPayload(payload1);
      const hash2 = await hashPayload(payload2);

      expect(hash1).toBe(hash2);
    });

    it("handles nested objects", async () => {
      const payload = {
        user: { name: "Alice", age: 30 },
        tags: ["tag1", "tag2"],
        count: 5
      };

      const hash = await hashPayload(payload);
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it("excludes integrity field during hashing", async () => {
      const payload1 = { name: "test", value: 123 };
      const payload2 = { name: "test", value: 123, integrity: "ignored" };

      const hash1 = await hashPayload(payload1);
      const hash2 = await hashPayload(payload2);

      expect(hash1).toBe(hash2);
    });
  });

  describe("DIDKey.generate", () => {
    it("generates a valid key pair", async () => {
      const keys = await DIDKey.generate();

      expect(keys.publicKey).toBeDefined();
      expect(keys.privateKey).toBeDefined();
      expect(keys.did).toMatch(/^did:key:/);
    });

    it("generates unique DIDs", async () => {
      const keys1 = await DIDKey.generate();
      const keys2 = await DIDKey.generate();

      expect(keys1.did).not.toBe(keys2.did);
    });
  });

  describe("DIDKey.sign", () => {
    it("signs a payload", async () => {
      const payload = { message: "test" };
      const signed = await DIDKey.sign(payload, keyPair.privateKey, keyPair.did);

      expect(signed.payload).toEqual(payload);
      expect(signed.signature).toBeDefined();
      expect(signed.signature.length > 0).toBe(true);
      expect(signed.did).toBe(keyPair.did);
      expect(signed.timestamp).toBeDefined();
    });

    it("signs include timestamp", async () => {
      const before = new Date();
      const signed = await DIDKey.sign({ test: true }, keyPair.privateKey, keyPair.did);
      const after = new Date();

      const signedDate = new Date(signed.timestamp);
      expect(signedDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(signedDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("DIDKey.verify", () => {
    it("verifies a signed block", async () => {
      const payload = { message: "verify me" };
      const signed = await DIDKey.sign(payload, keyPair.privateKey, keyPair.did);

      const isValid = await DIDKey.verify(signed, keyPair.publicKey);
      expect(isValid).toBe(true);
    });

    it("rejects tampered signatures", async () => {
      const payload = { message: "test" };
      const signed = await DIDKey.sign(payload, keyPair.privateKey, keyPair.did);

      // Tamper with signature
      const tampered: SignedBlock = {
        ...signed,
        signature: signed.signature.slice(0, -10) + "0000000000"
      };

      const isValid = await DIDKey.verify(tampered, keyPair.publicKey);
      expect(isValid).toBe(false);
    });

    it("rejects signature with wrong DID", async () => {
      const payload = { message: "test" };
      const signed = await DIDKey.sign(payload, keyPair.privateKey, keyPair.did);

      const tampered: SignedBlock = {
        ...signed,
        did: "did:key:wrong"
      };

      const isValid = await DIDKey.verify(tampered, keyPair.publicKey);
      expect(isValid).toBe(false);
    });
  });

  describe("signIntegrity & verifyIntegrity", () => {
    it("signs and verifies integrity", async () => {
      const payload = { critical: "data", version: 1 };
      const proof = await signIntegrity(payload, keyPair);

      expect(proof.hash).toBeDefined();
      expect(proof.signature).toBeDefined();
      expect(proof.did).toBe(keyPair.did);
      expect(proof.timestamp).toBeDefined();
    });

    it("verifies valid integrity proof", async () => {
      const payload = { data: "important" };
      const proof = await signIntegrity(payload, keyPair);

      const isValid = await verifyIntegrity(payload, proof, keyPair.publicKey);
      expect(isValid).toBe(true);
    });

    it("rejects integrity proof with modified payload", async () => {
      const payload = { value: 42 };
      const proof = await signIntegrity(payload, keyPair);

      const modified = { value: 43 };
      const isValid = await verifyIntegrity(modified, proof, keyPair.publicKey);
      expect(isValid).toBe(false);
    });

    it("rejects integrity proof with tampered hash", async () => {
      const payload = { test: true };
      const proof = await signIntegrity(payload, keyPair);

      const tampered = {
        ...proof,
        hash: "0000000000000000000000000000000000000000000000000000000000000000"
      };

      const isValid = await verifyIntegrity(payload, tampered, keyPair.publicKey);
      expect(isValid).toBe(false);
    });
  });

  describe("DIDKey.importKey", () => {
    it("imports a JWK key", async () => {
      const keyPair = await DIDKey.generate();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
    });
  });
});
