import { createFileRoute, Link } from "@tanstack/react-router";
import { ExamSimulator } from "@/components/exam/ExamSimulator";
import { TESTS, useQuizStore, type TestId } from "@/lib/quiz-store";

type Search = { test?: TestId };

export const Route = createFileRoute("/exam")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const t = search.test;
    return {
      test: t === "test1" || t === "test2" ? t : "test1",
    };
  },
  head: () => ({
    meta: [
      { title: "Exam — PM Exam Simulator" },
      {
        name: "description",
        content:
          "Take the PM exam: MCQ + written responses with a 60-minute timer.",
      },
      { property: "og:title", content: "Take the PM Exam" },
      {
        property: "og:description",
        content: "MCQ + written exam with timer, scoring, and review.",
      },
    ],
  }),
  component: ExamPage,
});

function ExamPage() {
  const { test } = Route.useSearch();
  const testId: TestId = test ?? "test1";
  const meta = TESTS.find((t) => t.id === testId)!;
  const questions = useQuizStore((s) =>
    s.questions.filter((q) => q.testId === testId),
  );
  return (
    <div>
      <div className="max-w-5xl mx-auto px-8 pt-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:underline">
          ← Back to home
        </Link>
        <span className="text-sm text-gray-500">{meta.title}</span>
      </div>
      <ExamSimulator quiz={questions} />
    </div>
  );
}
