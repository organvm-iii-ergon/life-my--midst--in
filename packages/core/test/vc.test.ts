import { describe, expect, it, beforeAll } from "vitest";
import { DIDKey, type KeyPair } from "../src/crypto";
import { VC, type W3CVerifiableCredential } from "../src/vc";

describe("VC Module", () => {
  let issuerKeyPair: KeyPair;

  beforeAll(async () => {
    issuerKeyPair = await DIDKey.generate();
  });

  describe("VC.calculateCID", () => {
    it("calculates a CID for JSON data", async () => {
      const data = { name: "test", value: 123 };
      const cid = await VC.calculateCID(data);

      expect(cid).toBeDefined();
      expect(typeof cid).toBe("string");
      expect(cid.length > 0).toBe(true);
    });

    it("calculates consistent CIDs for identical data", async () => {
      const data = { key: "value" };
      const cid1 = await VC.calculateCID(data);
      const cid2 = await VC.calculateCID(data);

      expect(cid1).toBe(cid2);
    });

    it("calculates different CIDs for different data", async () => {
      const cid1 = await VC.calculateCID({ a: 1 });
      const cid2 = await VC.calculateCID({ a: 2 });

      expect(cid1).not.toBe(cid2);
    });

    it("handles arrays", async () => {
      const data = [1, 2, 3];
      const cid = await VC.calculateCID(data);

      expect(cid).toBeDefined();
      expect(typeof cid).toBe("string");
    });

    it("handles nested structures", async () => {
      const data = {
        user: { name: "Alice", skills: ["TypeScript", "React"] },
        metadata: { created: "2024-01-01", public: true }
      };

      const cid = await VC.calculateCID(data);
      expect(cid).toBeDefined();
    });
  });

  describe("VC.issue", () => {
    it("creates a verifiable credential", async () => {
      const subjectData = { name: "Alice", skill: "engineering" };
      const vc = await VC.issue(issuerKeyPair, subjectData);

      expect(vc).toBeDefined();
      expect(vc.issuer).toBe(issuerKeyPair.did);
      expect(vc.credentialSubject).toEqual(subjectData);
    });

    it("includes W3C context", async () => {
      const vc = await VC.issue(issuerKeyPair, { test: true });

      expect(vc.context).toContain("https://www.w3.org/2018/credentials/v1");
    });

    it("sets credential type to VerifiableCredential by default", async () => {
      const vc = await VC.issue(issuerKeyPair, { test: true });

      expect(vc.type).toContain("VerifiableCredential");
    });

    it("allows custom credential types", async () => {
      const types = ["VerifiableCredential", "EducationCredential", "DegreeCredential"];
      const vc = await VC.issue(issuerKeyPair, { degree: "BA" }, types);

      expect(vc.type).toEqual(types);
    });

    it("includes proof with EdDSA signature", async () => {
      const vc = await VC.issue(issuerKeyPair, { data: true });

      expect(vc.proof).toBeDefined();
      expect(vc.proof.type).toBe("Ed25519Signature2018");
      expect(vc.proof.jws).toBeDefined();
      expect(vc.proof.jws.length > 0).toBe(true);
    });

    it("includes issuance date", async () => {
      const before = new Date();
      const vc = await VC.issue(issuerKeyPair, { test: true });
      const after = new Date();

      const issuanceDate = new Date(vc.issuanceDate);
      expect(issuanceDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(issuanceDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("sets verification method with DID", async () => {
      const vc = await VC.issue(issuerKeyPair, { test: true });

      expect(vc.proof.verificationMethod).toContain(issuerKeyPair.did);
      expect(vc.proof.verificationMethod).toContain("#keys-1");
    });

    it("sets proof purpose to assertionMethod", async () => {
      const vc = await VC.issue(issuerKeyPair, { test: true });

      expect(vc.proof.proofPurpose).toBe("assertionMethod");
    });

    it("handles complex subject data", async () => {
      const subjectData = {
        id: "did:example:subject",
        name: "Alice Smith",
        education: {
          institution: "MIT",
          degree: "BS Computer Science",
          graduationDate: "2020-05-30"
        },
        skills: ["TypeScript", "React", "Node.js"]
      };

      const vc = await VC.issue(issuerKeyPair, subjectData, ["UniversityDegreeCredential"]);

      expect(vc.credentialSubject).toEqual(subjectData);
      expect(vc.type).toContain("UniversityDegreeCredential");
    });
  });

  describe("VC Credential Structure", () => {
    it("creates structurally valid W3C VC", async () => {
      const vc = await VC.issue(issuerKeyPair, {
        name: "Test Credential",
        issued: "2024-01-01"
      });

      // Verify W3C VC structure
      expect(vc).toHaveProperty("@context" as any || "context");
      expect(vc).toHaveProperty("type");
      expect(vc).toHaveProperty("issuer");
      expect(vc).toHaveProperty("issuanceDate");
      expect(vc).toHaveProperty("credentialSubject");
      expect(vc).toHaveProperty("proof");

      // Verify proof structure
      expect(vc.proof).toHaveProperty("type");
      expect(vc.proof).toHaveProperty("created");
      expect(vc.proof).toHaveProperty("verificationMethod");
      expect(vc.proof).toHaveProperty("proofPurpose");
      expect(vc.proof).toHaveProperty("jws");
    });
  });
});
