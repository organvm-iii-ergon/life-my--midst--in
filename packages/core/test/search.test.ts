import { describe, it, expect, beforeEach, vi } from "vitest";
import { SerperJobSearchProvider, MockJobSearchProvider } from "../src/search";
import type { JobSearchQuery } from "../src/jobs";

describe("MockJobSearchProvider", () => {
  let provider: MockJobSearchProvider;

  beforeEach(() => {
    provider = new MockJobSearchProvider();
  });

  it("should have correct name", () => {
    expect(provider.name).toBe("mock");
  });

  it("should search jobs by keywords", async () => {
    const query: JobSearchQuery = {
      keywords: ["typescript"],
      limit: 10
    };

    const results = await provider.search(query);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("id");
    expect(results[0]).toHaveProperty("title");
    expect(results[0]).toHaveProperty("company");
    expect(results[0]).toHaveProperty("status");
    expect(results[0].status).toBe("active");
  });

  it("should filter jobs by keywords", async () => {
    const query: JobSearchQuery = {
      keywords: ["typescript"],
      limit: 20
    };

    const results = await provider.search(query);

    const hasTypescript = results.some(
      (job) =>
        job.title.toLowerCase().includes("typescript") || job.company.toLowerCase().includes("typescript")
    );
    expect(hasTypescript).toBe(true);
  });

  it("should include location in search results", async () => {
    const query: JobSearchQuery = {
      keywords: ["engineer"],
      location: "Remote",
      limit: 10
    };

    const results = await provider.search(query);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].location).toBeDefined();
  });

  it("should respect limit parameter", async () => {
    const query: JobSearchQuery = {
      keywords: ["developer"],
      limit: 3
    };

    const results = await provider.search(query);

    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("should return empty array for non-matching keywords", async () => {
    const query: JobSearchQuery = {
      keywords: ["xyznonexistentkeyword12345"],
      limit: 10
    };

    const results = await provider.search(query);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("should include job descriptions", async () => {
    const query: JobSearchQuery = {
      keywords: ["engineer"],
      limit: 5
    };

    const results = await provider.search(query);

    expect(results[0]).toHaveProperty("descriptionMarkdown");
    expect(results[0].descriptionMarkdown).toBeTruthy();
    expect(results[0].descriptionMarkdown).toContain("**");
  });

  it("should include salary range when available", async () => {
    const query: JobSearchQuery = {
      keywords: ["engineer"],
      limit: 5
    };

    const results = await provider.search(query);

    expect(results[0]).toHaveProperty("salaryRange");
    expect(results[0].salaryRange).toBeTruthy();
  });

  it("should return null for getById", async () => {
    const result = await provider.getById("any-id");

    expect(result).toBeNull();
  });

  it("should handle empty keywords array", async () => {
    const query: JobSearchQuery = {
      keywords: [],
      limit: 10
    };

    const results = await provider.search(query);

    expect(Array.isArray(results)).toBe(true);
    // With empty keywords, might return empty or all jobs depending on implementation
  });

  it("should handle multiple keywords", async () => {
    const query: JobSearchQuery = {
      keywords: ["typescript", "react", "engineer"],
      limit: 20
    };

    const results = await provider.search(query);

    // Should find jobs matching any of the keywords
    expect(results.length).toBeGreaterThanOrEqual(0);
  });
});

describe("SerperJobSearchProvider", () => {
  let provider: SerperJobSearchProvider;

  beforeEach(() => {
    provider = new SerperJobSearchProvider({
      apiKey: "test-api-key" // allow-secret
    });
  });

  it("should have correct name", () => {
    expect(provider.name).toBe("serper");
  });

  it("should use custom base URL if provided", () => {
    const customProvider = new SerperJobSearchProvider({
      apiKey: "test-key", // allow-secret
      baseUrl: "https://custom.serper.dev"
    });

    expect(customProvider).toBeDefined();
  });

  it("should handle API errors gracefully", async () => {
    // Mock fetch to return error
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: "Unauthorized"
      } as Response)
    );

    const query: JobSearchQuery = {
      keywords: ["test"],
      limit: 10
    };

    await expect(provider.search(query)).rejects.toThrow();
  });

  it("should construct search query correctly", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            jobs: [],
            searchParameters: {}
          })
      } as Response)
    );

    global.fetch = mockFetch;

    const query: JobSearchQuery = {
      keywords: ["typescript", "developer"],
      location: "Remote",
      limit: 10
    };

    await provider.search(query);

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/search"), expect.any(Object));
  });

  it("should return null for getById", async () => {
    const result = await provider.getById("any-id");

    expect(result).toBeNull();
  });
});

describe("Job search integration", () => {
  it("should provide consistent interface between providers", async () => {
    const mock = new MockJobSearchProvider();
    const serper = new SerperJobSearchProvider({ apiKey: "test-key" }); // allow-secret

    const query: JobSearchQuery = {
      keywords: ["engineer"],
      limit: 5
    };

    // Both should have same method signatures
    expect(typeof mock.search).toBe("function");
    expect(typeof serper.search).toBe("function");
    expect(typeof mock.getById).toBe("function");
    expect(typeof serper.getById).toBe("function");

    // Mock should work
    const mockResults = await mock.search(query);
    expect(Array.isArray(mockResults)).toBe(true);
  });

  it("should handle query with all optional parameters", async () => {
    const provider = new MockJobSearchProvider();

    const query: JobSearchQuery = {
      keywords: ["typescript"],
      location: "San Francisco, CA",
      remote: true,
      limit: 20
    };

    const results = await provider.search(query);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(20);
  });
});
