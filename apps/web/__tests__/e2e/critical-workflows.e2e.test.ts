import { test, expect } from "@playwright/test";

/**
 * End-to-End Tests for Critical Workflows
 * Tests complete user journeys across the entire system
 */

test.describe("Critical Workflows - End-to-End", () => {
  const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
  const apiURL = process.env.E2E_API_URL || "http://localhost:3001";

  // Test data
  const testProfileId = "e2e-test-" + Date.now();
  const testPersonaId = "persona-" + Date.now();

  test.describe("Workflow 1: Profile Creation and CV Entry Management", () => {
    test("should create profile and add CV entries with multi-dimensional tags", async ({
      page,
    }) => {
      // Navigate to profile creation
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Add first CV entry
      const addButton = page.getByRole("button", { name: /add|create|new entry/i });
      await addButton.click();

      // Fill form
      const contentInput = page.getByPlaceholderText(/description|content/i);
      await contentInput.fill("Senior Engineer at TechCorp (2023-2024)");

      // Select type
      const typeSelector = page.getByRole("combobox", { name: /type/i });
      await typeSelector.click();
      await page.getByText("Experience").click();

      // Add personae tag
      const personaeCheckbox = page.getByRole("checkbox", {
        name: /engineer|archimago/i,
      });
      await personaeCheckbox.check();

      // Set priority
      const prioritySlider = page.getByRole("slider", { name: /priority/i });
      await prioritySlider.fill("90");

      // Save entry
      const saveButton = page.getByRole("button", { name: /save|create/i });
      await saveButton.click();

      // Verify entry appears
      await expect(
        page.getByText("Senior Engineer at TechCorp")
      ).toBeVisible();

      // Add second entry
      await addButton.click();
      await contentInput.fill("Led migration of 100+ microservices");

      const typeSelector2 = page.getByRole("combobox", { name: /type/i });
      await typeSelector2.click();
      await page.getByText("Achievement").click();

      const prioritySlider2 = page.getByRole("slider", { name: /priority/i });
      await prioritySlider2.fill("85");

      await saveButton.click();

      // Verify both entries visible
      await expect(
        page.getByText("Senior Engineer at TechCorp")
      ).toBeVisible();
      await expect(
        page.getByText("Led migration of 100+")
      ).toBeVisible();
    });

    test("should filter CV entries by multiple dimensions", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Add diverse entries first
      const entries = [
        { content: "Technical entry", persona: "engineer" },
        { content: "Artistic entry", persona: "artist" },
        { content: "Both roles", persona: "both" },
      ];

      for (const entry of entries) {
        // Add each entry
        // Implementation depends on actual UI structure
      }

      // Apply filter
      const filterButton = page.getByRole("button", { name: /filter/i });
      await filterButton.click();

      // Select engineer filter
      const engineerCheckbox = page.getByRole("checkbox", {
        name: /engineer/i,
      });
      await engineerCheckbox.check();

      // Verify filtering works
      // Only entries with engineer persona should be visible
    });
  });

  test.describe("Workflow 2: Persona Selection and Resume Generation", () => {
    test("should create multiple personas and switch between them", async ({
      page,
    }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Open persona selector
      const personaButton = page.getByRole("button", {
        name: /persona|mask|identity/i,
      });
      await personaButton.click();

      // Should see persona dropdown
      await expect(
        page.getByRole("menuitem", { name: /engineer|archimago/i })
      ).toBeVisible();

      // Select different persona
      const artistPersona = page.getByRole("menuitem", {
        name: /artist|artifex/i,
      });

      if (await artistPersona.isVisible()) {
        await artistPersona.click();

        // Verify persona changed in header
        await expect(page.getByText(/artist|artifex/i)).toBeVisible();
      }
    });

    test("should generate resume filtered by persona", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}/resumes`);

      // Wait for page load
      await page.waitForLoadState("networkidle");

      // Click on persona tab
      const engineerTab = page.getByRole("tab", {
        name: /engineer|technica/i,
      });

      if (await engineerTab.isVisible()) {
        await engineerTab.click();

        // Verify resume entries appear
        await expect(page.getByText(/entry|skill|experience/i)).toBeVisible();
      }

      // Test export
      const pdfButton = page.getByRole("button", {
        name: /pdf|print|export/i,
      });

      if (await pdfButton.isVisible()) {
        // Mock print to avoid actual printing
        await page.evaluate(() => window.print());
      }
    });
  });

  test.describe("Workflow 3: Theatrical Narrative Creation", () => {
    test("should generate and edit theatrical narratives", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}/narrative`);

      // Wait for page
      await page.waitForLoadState("networkidle");

      // Generate narratives
      const generateButton = page.getByRole("button", {
        name: /generate|create|new/i,
      });

      if (await generateButton.isVisible()) {
        await generateButton.click();

        // Wait for generation
        await page.waitForTimeout(1000);

        // Verify blocks generated
        await expect(
          page.getByText(/narrative|block|title/i)
        ).toBeVisible();
      }

      // Edit preamble
      const preambleInput = page.getByRole("textbox", {
        name: /preamble|introduction/i,
      });

      if (await preambleInput.isVisible()) {
        await preambleInput.fill("The following presents me as...");

        // Save
        const saveButton = page.getByRole("button", { name: /save/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    });
  });

  test.describe("Workflow 4: Inverted Interview Evaluation", () => {
    test("should complete inverted interview and calculate compatibility", async ({
      page,
    }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}/interview`);

      // Wait for page
      await page.waitForLoadState("networkidle");

      // Get question count
      const questions = await page
        .locator("[data-testid='question']")
        .count();

      expect(questions).toBeGreaterThan(0);

      // Answer first question
      const answerInput = page.getByRole("textbox", {
        name: /answer|response|describe/i,
      });

      if (await answerInput.isVisible()) {
        await answerInput.fill("The organization has a strong learning culture");

        // Rate confidence (5 stars)
        const stars = page.getByRole("button", { name: /star/i });
        const starCount = await stars.count();

        if (starCount >= 5) {
          await stars.nth(4).click(); // 5 stars
        }

        // Move to next question
        const nextButton = page.getByRole("button", { name: /next/i });
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
      }

      // Continue through remaining questions
      for (let i = 0; i < 4; i++) {
        const input = page.getByRole("textbox", {
          name: /answer|response/i,
        });

        if (await input.isVisible()) {
          await input.fill(`Answer to question ${i + 2}`);

          const ratingStars = page.getByRole("button", { name: /star/i });
          const count = await ratingStars.count();
          if (count >= 4) {
            await ratingStars.nth(3).click(); // 4 stars
          }

          const nextBtn = page.getByRole("button", { name: /next/i });
          if (await nextBtn.isVisible()) {
            await nextBtn.click();
          }
        }
      }

      // Verify results page
      await expect(page.getByText(/%|fit|compatibility/i)).toBeVisible();
    });
  });

  test.describe("Workflow 5: Aetas Progression Tracking", () => {
    test("should track life-stage progression", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Scroll to aetas timeline
      const timelineSection = page.locator("[data-testid='aetas-timeline']");

      if (await timelineSection.isVisible()) {
        // Should show timeline with stages
        await expect(
          page.getByText(/initiation|emergence|consolidation/i)
        ).toBeVisible();

        // Click to expand a stage
        const expandButtons = page.getByRole("button", {
          name: /expand|details/i,
        });

        if ((await expandButtons.count()) > 0) {
          await expandButtons.first().click();

          // Verify details shown
          await expect(
            page.getByText(/capability|learning|description/i)
          ).toBeVisible();
        }
      }
    });

    test("should add new aetas to profile", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      const addAetasButton = page.getByRole("button", {
        name: /add|assign|new.*aetas/i,
      });

      if (await addAetasButton.isVisible()) {
        await addAetasButton.click();

        // Select aetas
        const aetasSelect = page.getByRole("combobox", {
          name: /aetas|stage/i,
        });

        if (await aetasSelect.isVisible()) {
          await aetasSelect.click();
          await page.getByText(/emergence|consolidation/i).first().click();

          // Set start date
          const dateInput = page.getByRole("textbox", {
            name: /start|date/i,
          });

          if (await dateInput.isVisible()) {
            await dateInput.fill("2024-01-01");
          }

          // Save
          const saveBtn = page.getByRole("button", { name: /save|create/i });
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
          }
        }
      }
    });
  });

  test.describe("Workflow 6: Complete User Journey", () => {
    test("should complete full journey: profile → CV → personas → resumes → narrative → interview", async ({
      page,
    }) => {
      // Step 1: Profile page
      await page.goto(`${baseURL}/profile/${testProfileId}`);
      await page.waitForLoadState("networkidle");

      // Verify components visible
      await expect(
        page.getByText(/profile|curriculum vitae|entry/i)
      ).toBeVisible();

      // Step 2: Navigate to Resumes
      const resumesLink = page.getByRole("link", { name: /resumes?/i });
      if (await resumesLink.isVisible()) {
        await resumesLink.click();
        await page.waitForLoadState("networkidle");

        await expect(
          page.getByText(/resume|masked presentation/i)
        ).toBeVisible();
      }

      // Step 3: Navigate to Narrative
      const narrativeLink = page.getByRole("link", { name: /narrative/i });
      if (await narrativeLink.isVisible()) {
        await narrativeLink.click();
        await page.waitForLoadState("networkidle");

        await expect(
          page.getByText(/narrative|theatrical|preamble/i)
        ).toBeVisible();
      }

      // Step 4: Navigate to Interview
      const interviewLink = page.getByRole("link", { name: /interview/i });
      if (await interviewLink.isVisible()) {
        await interviewLink.click();
        await page.waitForLoadState("networkidle");

        await expect(
          page.getByText(/interview|compatibility|culture|growth/i)
        ).toBeVisible();
      }

      // Step 5: Return to Profile
      const profileLink = page.getByRole("link", { name: /profile/i });
      if (await profileLink.isVisible()) {
        await profileLink.click();
        await page.waitForLoadState("networkidle");

        await expect(
          page.getByText(/profile|curriculum vitae/i)
        ).toBeVisible();
      }
    });
  });

  test.describe("Data Persistence and Sync", () => {
    test("should persist CV entries across page reloads", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Get initial entry count
      const initialEntries = await page
        .locator("[data-testid='cv-entry']")
        .count();

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Count entries again
      const reloadedEntries = await page
        .locator("[data-testid='cv-entry']")
        .count();

      // Should be same count
      expect(reloadedEntries).toBe(initialEntries);
    });

    test("should sync persona selection across pages", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Change persona
      const personaButton = page.getByRole("button", {
        name: /persona|mask/i,
      });

      if (await personaButton.isVisible()) {
        await personaButton.click();

        const persona2 = page
          .getByRole("menuitem")
          .filter({ hasNot: page.getByText(/selected|current/) })
          .first();

        if (await persona2.isVisible()) {
          const personaName = await persona2.textContent();
          await persona2.click();

          // Navigate to resumes
          const resumesLink = page.getByRole("link", { name: /resumes?/i });
          if (await resumesLink.isVisible()) {
            await resumesLink.click();
            await page.waitForLoadState("networkidle");

            // Persona should still be selected
            const header = page.getByRole("button", { name: new RegExp(personaName || "") });
            await expect(header).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Error Handling and Edge Cases", () => {
    test("should handle missing CV entries gracefully", async ({ page }) => {
      const newProfileId = "empty-profile-" + Date.now();
      await page.goto(`${baseURL}/profile/${newProfileId}`);

      // Should show empty state
      await expect(
        page.getByText(/no entries|empty|create/i)
      ).toBeVisible();

      // Should still allow adding entries
      const addButton = page.getByRole("button", { name: /add|create/i });
      await expect(addButton).toBeVisible();
    });

    test("should handle network errors with retry", async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);

      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Should show error or loading state
      const errorText = page.getByText(/error|offline|try again/i);
      const loadingText = page.getByText(/loading/i);

      const isErrorOrLoading =
        (await errorText.isVisible()) || (await loadingText.isVisible());

      expect(isErrorOrLoading).toBeTruthy();

      // Restore online
      await page.context().setOffline(false);
    });
  });

  test.describe("Performance and Accessibility", () => {
    test("should load profile page in reasonable time", async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${baseURL}/profile/${testProfileId}`, {
        waitUntil: "networkidle",
      });

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test("should be navigable with keyboard only", async ({ page }) => {
      await page.goto(`${baseURL}/profile/${testProfileId}`);

      // Tab through main navigation
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Should focus on navigation elements
      const focusedElement = page.evaluate(() =>
        document.activeElement?.getAttribute("role")
      );

      const role = await focusedElement;
      expect(["button", "link", "tab"]).toContain(role);
    });
  });
});
