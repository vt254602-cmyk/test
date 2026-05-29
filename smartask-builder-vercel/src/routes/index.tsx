import { createFileRoute, Link } from "@tanstack/react-router";
import { TESTS, useQuizStore } from "@/lib/quiz-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PM Exam Simulator" },
      {
        name: "description",
        content:
          "Practice Product Management interviews with MCQ + written exam simulator, timer, and review.",
      },
      { property: "og:title", content: "PM Exam Simulator" },
      {
        property: "og:description",
        content:
          "Practice Product Management interviews with MCQ + written exam simulator.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const questions = useQuizStore((s) => s.questions);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm border space-y-4">
          <h1 className="text-5xl font-bold">Product Management Exam Simulator</h1>
          <p className="text-lg text-gray-600">
            Mixed exam mode with MCQ + written responses, 60-minute timer,
            scoring, and review.
          </p>
          <Link
            to="/admin"
            className="inline-block px-6 py-3 rounded-2xl border text-sm"
          >
            Manage Questions →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {TESTS.map((t) => {
            const qs = questions.filter((q) => q.testId === t.id);
            const mcq = qs.filter((q) => q.type === "mcq").length;
            const written = qs.length - mcq;
            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl border p-6 shadow-sm space-y-4 flex flex-col"
              >
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold">{t.title}</h2>
                  <p className="text-gray-600">{t.subtitle}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl border bg-gray-50">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold">{qs.length}</p>
                  </div>
                  <div className="p-3 rounded-2xl border bg-gray-50">
                    <p className="text-xs text-gray-500">MCQ</p>
                    <p className="text-xl font-bold">{mcq}</p>
                  </div>
                  <div className="p-3 rounded-2xl border bg-gray-50">
                    <p className="text-xs text-gray-500">Written</p>
                    <p className="text-xl font-bold">{written}</p>
                  </div>
                </div>
                <Link
                  to="/exam"
                  search={{ test: t.id }}
                  className="px-6 py-3 rounded-2xl bg-black text-white text-center"
                >
                  Start {t.title.split("—")[0].trim()}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
