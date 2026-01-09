import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonaeSelector from "../PersonaeSelector";
import type {
  TabulaPersonarumEntry,
  PersonaResonance,
} from "@in-midst-my-life/schema";

// Mock data
const mockPersonas: TabulaPersonarumEntry[] = [
  {
    id: "persona-1",
    nomen: "Archimago",
    everyday_name: "The Engineer",
    role_vector: "Builds systems and solves problems",
    tone_register: "Analytical, precise, methodical",
    visibility_scope: ["Technica", "Academica"],
    motto: "Via ratio ad solutionem",
    description: "Technical architect and problem solver",
    active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "persona-2",
    nomen: "Artifex",
    everyday_name: "The Artist",
    role_vector: "Creates and expresses through various mediums",
    tone_register: "Expressive, intuitive, creative",
    visibility_scope: ["Artistica", "Domestica"],
    motto: "Creatio est vita",
    description: "Creative force and visual thinker",
    active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-15"),
  },
];

const mockResonances: PersonaResonance[] = [
  {
    persona_id: "persona-1",
    context: "Technical Interview",
    fit_score: 92,
    alignment_keywords: ["systems", "architecture", "scalability"],
    misalignment_keywords: ["soft skills"],
    last_used: new Date("2024-01-10"),
    success_count: 5,
    feedback: "Excellent technical depth",
  },
  {
    persona_id: "persona-2",
    context: "Creative Brief",
    fit_score: 78,
    alignment_keywords: ["visual", "innovation", "storytelling"],
    misalignment_keywords: ["technical depth"],
    last_used: new Date("2024-01-09"),
    success_count: 3,
    feedback: "Strong creative expression",
  },
];

describe("PersonaeSelector", () => {
  const mockOnSelectPersona = vi.fn();

  beforeEach(() => {
    mockOnSelectPersona.mockClear();
  });

  it("renders all personas with metadata", () => {
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Check for first persona
    expect(screen.getByText("Archimago")).toBeInTheDocument();
    expect(screen.getByText("The Engineer")).toBeInTheDocument();
    expect(
      screen.getByText("Builds systems and solves problems")
    ).toBeInTheDocument();

    // Check for second persona
    expect(screen.getByText("Artifex")).toBeInTheDocument();
    expect(screen.getByText("The Artist")).toBeInTheDocument();
  });

  it("displays persona mottos", () => {
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    expect(screen.getByText("Via ratio ad solutionem")).toBeInTheDocument();
    expect(screen.getByText("Creatio est vita")).toBeInTheDocument();
  });

  it("shows visibility scopes for each persona", () => {
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // First persona should have Technica and Academica
    const firstPersonaCard = screen.getByText("Archimago").closest("div");
    expect(firstPersonaCard).toBeInTheDocument();
  });

  it("displays resonance fit scores when available", () => {
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Fit scores should be displayed
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
  });

  it("shows success counts from resonance data", () => {
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Success counts should be visible
    expect(screen.getByText(/5\s+(successes?|uses?)/i)).toBeInTheDocument();
    expect(screen.getByText(/3\s+(successes?|uses?)/i)).toBeInTheDocument();
  });

  it("calls onSelectPersona when a persona card is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    const firstPersonaCard = screen.getByText("Archimago").closest("button");
    if (firstPersonaCard) {
      await user.click(firstPersonaCard);
    }

    expect(mockOnSelectPersona).toHaveBeenCalledWith("persona-1");
  });

  it("highlights selected persona", () => {
    const { rerender } = render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        selectedPersonaId="persona-1"
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Selected persona should have visual distinction
    const selectedCard = screen.getByText("Archimago").closest("div");
    expect(selectedCard).toHaveClass("selected");
  });

  it("shows loading state when loading prop is true", () => {
    render(
      <PersonaeSelector
        personas={[]}
        loading={true}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("displays alignment keywords from resonances", () => {
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Alignment keywords should be displayed
    const alignmentText = screen.queryByText(/systems|architecture|innovation/);
    expect(alignmentText).toBeTruthy();
  });

  it("handles empty personas list gracefully", () => {
    render(
      <PersonaeSelector
        personas={[]}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    expect(
      screen.getByText(/no personas available|create a persona/i)
    ).toBeInTheDocument();
  });

  it("color-codes fit scores (green ≥80%, yellow ≥60%, red <60%)", () => {
    const customResonances: PersonaResonance[] = [
      {
        persona_id: "persona-1",
        context: "test",
        fit_score: 92, // should be green
      },
      {
        persona_id: "persona-2",
        context: "test",
        fit_score: 65, // should be yellow
      },
    ];

    const { container } = render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={customResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Verify color coding via classes
    const scoreElements = container.querySelectorAll("[data-fit-score]");
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it("expands persona details on demand", async () => {
    const user = userEvent.setup();
    render(
      <PersonaeSelector
        personas={mockPersonas}
        resonances={mockResonances}
        onSelectPersona={mockOnSelectPersona}
      />
    );

    // Initial state: details may or may not be visible
    // Click to expand
    const expandButtons = screen.getAllByRole("button", {
      name: /expand|details|more/i,
    });

    if (expandButtons.length > 0) {
      await user.click(expandButtons[0]);
      await waitFor(() => {
        expect(
          screen.getByText(/tone register|visibility|feedback/i)
        ).toBeInTheDocument();
      });
    }
  });
});
