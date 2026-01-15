import { MockJobSearchProvider } from "../packages/core/src/search";
import { createHunterAgent } from "../packages/core/src/hunter";

console.log("MockJobSearchProvider:", MockJobSearchProvider);
try {
  new MockJobSearchProvider();
  console.log("Instantiated MockJobSearchProvider");
} catch (e) {
  console.error("Failed to instantiate:", e);
}

try {
  createHunterAgent();
  console.log("Created Hunter Agent");
} catch (e) {
  console.error("Failed to create agent:", e);
}
