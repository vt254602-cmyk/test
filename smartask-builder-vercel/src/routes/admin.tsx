import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { QuestionEditor } from "@/components/exam/QuestionEditor";
import { TESTS, useQuizStore, type Question } from "@/lib/quiz-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Manage Questions — PM Exam Simulator" },
      {
        name: "description",
        content: "Add, edit, and remove MCQ and written questions for the exam.",
      },
      { property: "og:title", content: "Manage Questions" },
      {
        property: "og:description",
        content: "Curate the PM exam question bank.",
      },
    ],
  }),
  component: AdminPage,
});

type Mode = { kind: "list" } | { kind: "new" } | { kind: "edit"; q: Question };

function AdminPage() {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useQuizStore();
  const [mode, setMode] = useState<Mode>({ kind: "list" });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-gray-600 hover:underline">
              ← Back to home
            </Link>
            <h1 className="text-4xl font-bold mt-2">Manage Questions</h1>
            <p className="text-gray-600">
              {questions.length} question{questions.length === 1 ? "" : "s"} in the bank.
              Changes are kept in memory and reset on refresh.
            </p>
          </div>
          {mode.kind === "list" && (
            <button
              onClick={() => setMode({ kind: "new" })}
              className="px-5 py-3 rounded-2xl bg-black text-white"
            >
              + New question
            </button>
          )}
        </div>

        {mode.kind === "new" && (
          <QuestionEditor
            onCancel={() => setMode({ kind: "list" })}
            onSave={(q) => {
              addQuestion(q);
              setMode({ kind: "list" });
            }}
          />
        )}

        {mode.kind === "edit" && (
          <QuestionEditor
            initial={mode.q}
            onCancel={() => setMode({ kind: "list" })}
            onSave={(q) => {
              updateQuestion(mode.q.id, q);
              setMode({ kind: "list" });
            }}
          />
        )}

        {mode.kind === "list" && (
          <div className="space-y-3">
            {questions.length === 0 && (
              <div className="bg-white rounded-3xl border p-10 text-center text-gray-600">
                No questions yet. Add your first one.
              </div>
            )}
            {questions.map((q, i) => {
              const testMeta = TESTS.find((t) => t.id === q.testId);
              return (
              <div
                key={q.id}
                className="bg-white rounded-3xl border p-6 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-xs">
                      {q.type === "mcq" ? "Multiple Choice" : "Written"}
                    </div>
                    <div className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                      {testMeta?.title ?? q.testId}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">
                    {i + 1}. {q.question}
                  </h3>
                  {q.type === "mcq" && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Answer:</span>{" "}
                      {Array.isArray(q.answer) ? q.answer.join(" • ") : q.answer}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setMode({ kind: "edit", q })}
                    className="px-4 py-2 rounded-xl border text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this question?")) deleteQuestion(q.id);
                    }}
                    className="px-4 py-2 rounded-xl border text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
