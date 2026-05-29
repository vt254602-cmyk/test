import { useState } from "react";
import type { Question, McqQuestion, TextQuestion, TestId } from "@/lib/quiz-store";
import { TESTS } from "@/lib/quiz-store";

type Draft =
  | {
      type: "mcq";
      question: string;
      options: string[];
      multi: boolean;
      correctIndexes: number[];
      explanation: string;
    }
  | {
      type: "text";
      question: string;
      sample: string;
    };

function toDraft(q?: Question): Draft {
  if (!q) {
    return {
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      multi: false,
      correctIndexes: [0],
      explanation: "",
    };
  }
  if (q.type === "mcq") {
    const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    const indexes = answers
      .map((a) => q.options.indexOf(a))
      .filter((i) => i >= 0);
    return {
      type: "mcq",
      question: q.question,
      options: [...q.options],
      multi: Array.isArray(q.answer),
      correctIndexes: indexes.length ? indexes : [0],
      explanation: q.explanation,
    };
  }
  return { type: "text", question: q.question, sample: q.sample };
}

export function QuestionEditor({
  initial,
  defaultTestId = "test1",
  onSave,
  onCancel,
}: {
  initial?: Question;
  defaultTestId?: TestId;
  onSave: (q: Omit<McqQuestion, "id"> | Omit<TextQuestion, "id">) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [testId, setTestId] = useState<TestId>(initial?.testId ?? defaultTestId);
  const [error, setError] = useState<string | null>(null);

  const setType = (type: "mcq" | "text") => {
    setError(null);
    if (type === "mcq") {
      setDraft({
        type: "mcq",
        question: draft.question,
        options: draft.type === "mcq" ? draft.options : ["", "", "", ""],
        multi: draft.type === "mcq" ? draft.multi : false,
        correctIndexes: draft.type === "mcq" ? draft.correctIndexes : [0],
        explanation: draft.type === "mcq" ? draft.explanation : "",
      });
    } else {
      setDraft({
        type: "text",
        question: draft.question,
        sample: draft.type === "text" ? draft.sample : "",
      });
    }
  };

  const handleSave = () => {
    if (!draft.question.trim()) {
      setError("Question text is required.");
      return;
    }
    if (draft.type === "mcq") {
      const opts = draft.options.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) {
        setError("Provide at least 2 options.");
        return;
      }
      const correct = draft.correctIndexes
        .map((i) => draft.options[i]?.trim())
        .filter((v): v is string => Boolean(v));
      if (correct.length === 0) {
        setError("Select at least one correct answer.");
        return;
      }
      onSave({
        testId,
        type: "mcq",
        question: draft.question.trim(),
        options: opts,
        answer: draft.multi ? correct : correct[0],
        explanation: draft.explanation.trim(),
      });
    } else {
      if (!draft.sample.trim()) {
        setError("Sample answer is required for written questions.");
        return;
      }
      onSave({
        testId,
        type: "text",
        question: draft.question.trim(),
        sample: draft.sample.trim(),
      });
    }
  };

  const toggleCorrect = (i: number) => {
    if (draft.type !== "mcq") return;
    if (draft.multi) {
      const has = draft.correctIndexes.includes(i);
      setDraft({
        ...draft,
        correctIndexes: has
          ? draft.correctIndexes.filter((x) => x !== i)
          : [...draft.correctIndexes, i],
      });
    } else {
      setDraft({ ...draft, correctIndexes: [i] });
    }
  };

  return (
    <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["mcq", "text"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-sm border ${
                draft.type === t ? "bg-black text-white border-black" : "bg-white"
              }`}
            >
              {t === "mcq" ? "Multiple Choice" : "Written"}
            </button>
          ))}
        </div>
        <select
          value={testId}
          onChange={(e) => setTestId(e.target.value as TestId)}
          className="ml-auto rounded-full border px-4 py-2 text-sm bg-white"
        >
          {TESTS.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Question</label>
        <textarea
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          className="w-full min-h-[80px] rounded-2xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {draft.type === "mcq" ? (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.multi}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  multi: e.target.checked,
                  correctIndexes: e.target.checked
                    ? draft.correctIndexes
                    : draft.correctIndexes.slice(0, 1),
                })
              }
            />
            Allow multiple correct answers
          </label>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Options (select correct {draft.multi ? "answers" : "answer"})
            </label>
            {draft.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type={draft.multi ? "checkbox" : "radio"}
                  name="correct"
                  checked={draft.correctIndexes.includes(i)}
                  onChange={() => toggleCorrect(i)}
                />
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...draft.options];
                    next[i] = e.target.value;
                    setDraft({ ...draft, options: next });
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 rounded-2xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {draft.options.length > 2 && (
                  <button
                    onClick={() => {
                      const next = draft.options.filter((_, idx) => idx !== i);
                      setDraft({
                        ...draft,
                        options: next,
                        correctIndexes: draft.correctIndexes
                          .filter((x) => x !== i)
                          .map((x) => (x > i ? x - 1 : x)),
                      });
                    }}
                    className="px-3 py-2 rounded-xl border text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {draft.options.length < 6 && (
              <button
                onClick={() => setDraft({ ...draft, options: [...draft.options, ""] })}
                className="px-4 py-2 rounded-xl border text-sm"
              >
                + Add option
              </button>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Explanation</label>
            <textarea
              value={draft.explanation}
              onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
              className="w-full min-h-[60px] rounded-2xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Sample answer</label>
          <textarea
            value={draft.sample}
            onChange={(e) => setDraft({ ...draft, sample: e.target.value })}
            className="w-full min-h-[100px] rounded-2xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-5 py-2 rounded-2xl border">
          Cancel
        </button>
        <button onClick={handleSave} className="px-5 py-2 rounded-2xl bg-black text-white">
          Save
        </button>
      </div>
    </div>
  );
}
