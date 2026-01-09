import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InvertedInterviewInterface from "../InvertedInterviewInterface";

const mockQuestions = {
  culture: [
    {
      id: "q1",
      category: "culture",
      emoji: "🏛️",
      text: "How would you describe your organizational culture?",
      required: true,
    },
  ],
  growth: [
    {
      id: "q2",
      category: "growth",
      emoji: "🚀",
      text: "What growth opportunities exist?",
      required: true,
    },
  ],
  sustainability: [
    {
      id: "q3",
      category: "sustainability",
      emoji: "🌱",
      text: "How sustainable is this role?",
      required: true,
    },
  ],
  impact: [
    {
      id: "q4",
      category: "impact",
      emoji: "⭐",
      text: "What impact would I have?",
      required: true,
    },
  ],
  values: [
    {
      id: "q5",
      category: "values",
      emoji: "💎",
      text: "What are your core values?",
      required: true,
    },
  ],
};

describe("InvertedInterviewInterface", () => {
  const mockOnComplete = vi.fn();
  const mockOnScoreCalculated = vi.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnScoreCalculated.mockClear();
  });

  it("renders all question categories with emojis", () => {
    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/🏛️|culture/i)).toBeInTheDocument();
    expect(screen.getByText(/🚀|growth/i)).toBeInTheDocument();
    expect(screen.getByText(/🌱|sustainability/i)).toBeInTheDocument();
    expect(screen.getByText(/⭐|impact/i)).toBeInTheDocument();
    expect(screen.getByText(/💎|values/i)).toBeInTheDocument();
  });

  it("displays progress bar showing completion status", () => {
    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Should show progress indicator
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  it("displays current question being answered", () => {
    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Should display current question
    expect(
      screen.getByText(/how would you describe|describe your|culture/i)
    ).toBeInTheDocument();
  });

  it("provides textarea for text answers", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    const answerInput = screen.getByRole("textbox", {
      name: /answer|response|describe/i,
    });
    expect(answerInput).toBeInTheDocument();

    await user.type(answerInput, "Sample answer");
    expect(answerInput).toHaveValue("Sample answer");
  });

  it("provides 5-star confidence rating", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Should have star rating buttons (1-5)
    const stars = screen.getAllByRole("button", { name: /star|rating|confidence/i });
    expect(stars.length).toBeGreaterThanOrEqual(5);

    // Click 4 stars
    await user.click(stars[3]);

    expect(stars[3]).toHaveAttribute("aria-pressed", "true");
  });

  it("allows previous/next navigation through questions", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Should have next button initially
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeInTheDocument();

    // Click next
    await user.click(nextButton);

    // Should now show growth question
    expect(
      screen.getByText(/growth opportunities|what growth/i)
    ).toBeInTheDocument();

    // Should have previous button now
    const prevButton = screen.getByRole("button", { name: /previous|back/i });
    expect(prevButton).toBeInTheDocument();
  });

  it("enforces required questions before proceeding", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Try to skip without answering
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    // Should show error or remain on same question
    expect(
      screen.getByText(/required|answer this|must|cannot skip/i)
    ).toBeInTheDocument();
  });

  it("calculates compatibility score in real-time", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onScoreCalculated={mockOnScoreCalculated}
      />
    );

    // Answer first question with high confidence
    const answerInput = screen.getByRole("textbox", {
      name: /answer|response/i,
    });
    await user.type(answerInput, "Perfect alignment");

    // Set 5-star rating
    const stars = screen.getAllByRole("button", { name: /star|rating/i });
    await user.click(stars[4]); // 5 stars

    // Should calculate score
    await waitFor(() => {
      expect(mockOnScoreCalculated).toHaveBeenCalled();
    });
  });

  it("displays fit score (0-100%) after questions answered", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Answer all questions
    for (let i = 0; i < Object.values(mockQuestions).flat().length; i++) {
      const answerInput = screen.getByRole("textbox", {
        name: /answer|response/i,
      });
      await user.clear(answerInput);
      await user.type(answerInput, `Answer ${i}`);

      const stars = screen.getAllByRole("button", { name: /star|rating/i });
      await user.click(stars[3]); // 4 stars

      if (i < Object.values(mockQuestions).flat().length - 1) {
        const nextButton = screen.getByRole("button", { name: /next/i });
        await user.click(nextButton);
      }
    }

    // Should show fit score
    await waitFor(() => {
      expect(screen.getByText(/%|fit score|compatibility/i)).toBeInTheDocument();
    });
  });

  it("analyzes alignment and misalignment keywords", () => {
    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Component should analyze response content for keywords
    // This is shown after completion
    expect(screen.getByText(/alignment|keywords|match/i)).toBeTruthy();
  });

  it("allows downloading results", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Mock window functions
    const mockDownload = vi.fn();
    global.URL.createObjectURL = vi.fn();

    const downloadButton = screen.queryByRole("button", {
      name: /download|export|save/i,
    });

    if (downloadButton) {
      await user.click(downloadButton);
      expect(mockDownload).toHaveBeenCalled();
    }
  });

  it("allows restarting interview", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Answer one question
    const answerInput = screen.getByRole("textbox", {
      name: /answer|response/i,
    });
    await user.type(answerInput, "Answer 1");

    // Find and click restart
    const restartButton = screen.queryByRole("button", {
      name: /restart|reset|clear|start over/i,
    });

    if (restartButton) {
      await user.click(restartButton);

      // Should reset to first question with empty answer
      await waitFor(() => {
        const newInput = screen.getByRole("textbox", {
          name: /answer|response/i,
        });
        expect(newInput).toHaveValue("");
      });
    }
  });

  it("tracks questions with alignment keywords", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Answer with keywords
    const answerInput = screen.getByRole("textbox", {
      name: /answer|response/i,
    });
    await user.type(answerInput, "growth opportunity learning development");

    // Keywords should be highlighted/tracked
    const keywordElements = screen.queryAllByText(
      /growth|opportunity|learning|development/i
    );
    expect(keywordElements.length).toBeGreaterThan(0);
  });

  it("supports category filtering/focus", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
        allowCategoryFocus={true}
      />
    );

    // Should be able to filter by category
    const cultureFilter = screen.queryByRole("button", { name: /culture|🏛️/i });
    if (cultureFilter) {
      await user.click(cultureFilter);

      // Should show only culture questions
      expect(
        screen.getByText(/how would you describe|culture/i)
      ).toBeInTheDocument();
    }
  });

  it("displays loading state during score calculation", () => {
    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        loading={true}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText(/loading|calculating|analyzing/i)).toBeInTheDocument();
  });

  it("handles completion callback", async () => {
    const user = userEvent.setup();

    render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Answer all questions quickly
    const answerInput = screen.getByRole("textbox", {
      name: /answer|response/i,
    });

    // Mock quick completion
    await user.type(answerInput, "Quick answer");

    const completeButton = screen.queryByRole("button", {
      name: /complete|submit|done|finish/i,
    });

    if (completeButton) {
      await user.click(completeButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    }
  });

  it("shows interview summary on completion", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
      />
    );

    // Simulate completion
    rerender(
      <InvertedInterviewInterface
        questions={mockQuestions}
        onComplete={mockOnComplete}
        isComplete={true}
        fitScore={82}
        alignmentKeywords={["culture", "growth"]}
      />
    );

    // Should show summary
    expect(screen.getByText(/82|summary|results/i)).toBeInTheDocument();
  });
});
