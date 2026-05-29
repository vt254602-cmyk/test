import { useEffect, useState } from "react";
import type { Question } from "@/lib/quiz-store";

const TIME_LIMIT_SECONDS = 60 * 60;

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

type Answer = string | string[];

function isCorrect(q: Extract<Question, { type: "mcq" }>, given: Answer | undefined) {
  if (given == null) return false;
  if (Array.isArray(q.answer)) {
    const a = Array.isArray(given) ? given : [given];
    if (a.length !== q.answer.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...q.answer].sort();
    return sortedA.every((v, i) => v === sortedB[i]);
  }
  return given === q.answer;
}

function displayAnswer(a: Answer | undefined) {
  if (a == null || (Array.isArray(a) && a.length === 0)) return "No answer";
  return Array.isArray(a) ? a.join("\n") : a;
}

export function ExamSimulator({ quiz }: { quiz: Question[] }) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  if (quiz.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-sm border text-center">
          <h1 className="text-3xl font-bold mb-2">No questions yet</h1>
          <p className="text-gray-600">
            Add some questions in the admin panel to start the exam.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz[current];
  const mcqQuestions = quiz.filter(
    (q): q is Extract<Question, { type: "mcq" }> => q.type === "mcq",
  );
  const score = mcqQuestions.reduce(
    (acc, q) => (isCorrect(q, answers[q.id]) ? acc + 1 : acc),
    0,
  );

  const setAnswer = (value: Answer) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const toggleMulti = (option: string) => {
    const cur = answers[currentQuestion.id];
    const arr = Array.isArray(cur) ? cur : [];
    const next = arr.includes(option)
      ? arr.filter((o) => o !== option)
      : [...arr, option];
    setAnswer(next);
  };

  const nextQuestion = () => {
    if (current < quiz.length - 1) setCurrent(current + 1);
    else setFinished(true);
  };

  const prevQuestion = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(TIME_LIMIT_SECONDS);
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-sm border space-y-6">
          <div>
            <h1 className="text-5xl font-bold mb-4">Product Management Exam Simulator</h1>
            <p className="text-lg text-gray-600">
              Mixed exam mode with MCQ + written responses, timer, scoring, and review mode.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border bg-gray-50">
              <p className="text-sm text-gray-500">Questions</p>
              <h2 className="text-3xl font-bold">{quiz.length}</h2>
            </div>
            <div className="p-5 rounded-2xl border bg-gray-50">
              <p className="text-sm text-gray-500">MCQ Auto-Graded</p>
              <h2 className="text-3xl font-bold">{mcqQuestions.length}</h2>
            </div>
            <div className="p-5 rounded-2xl border bg-gray-50">
              <p className="text-sm text-gray-500">Time Limit</p>
              <h2 className="text-3xl font-bold">60 min</h2>
            </div>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 rounded-2xl bg-black text-white text-lg"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-10 border shadow-sm space-y-4">
            <h1 className="text-5xl font-bold">Exam Completed</h1>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border bg-gray-50">
                <p className="text-gray-500">MCQ Score</p>
                <h2 className="text-5xl font-bold">
                  {score}/{mcqQuestions.length}
                </h2>
              </div>
              <div className="p-6 rounded-2xl border bg-gray-50">
                <p className="text-gray-500">Completion</p>
                <h2 className="text-5xl font-bold">
                  {Object.keys(answers).length}/{quiz.length}
                </h2>
              </div>
            </div>
            <button
              onClick={restart}
              className="px-6 py-3 rounded-2xl bg-black text-white"
            >
              Restart Exam
            </button>
          </div>
          <div className="space-y-4">
            {quiz.map((q, index) => {
              const userAnswer = answers[q.id];
              const correct = q.type === "mcq" && isCorrect(q, userAnswer);
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl border p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold">
                      {index + 1}. {q.question}
                    </h3>
                    {q.type === "mcq" && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                          correct
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {correct ? "Correct" : "Wrong"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="whitespace-pre-line">
                      <span className="font-medium">Your answer:</span>{" "}
                      {displayAnswer(userAnswer)}
                    </p>
                    {q.type === "mcq" ? (
                      <>
                        <p className="whitespace-pre-line">
                          <span className="font-medium">Correct answer:</span>{" "}
                          {Array.isArray(q.answer) ? q.answer.join("\n") : q.answer}
                        </p>
                        {q.explanation && (
                          <p className="text-gray-600">{q.explanation}</p>
                        )}
                      </>
                    ) : (
                      <div className="p-4 rounded-2xl bg-gray-50 border">
                        <p className="font-medium mb-1">Suggested direction:</p>
                        <p className="text-gray-700 whitespace-pre-line">{q.sample}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const isMulti = currentQuestion.type === "mcq" && Array.isArray(currentQuestion.answer);
  const currentValue = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Question</p>
            <h2 className="text-2xl font-bold">
              {current + 1} / {quiz.length}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Time Remaining</p>
            <h2 className="text-3xl font-bold">{formatTime(timeLeft)}</h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl border p-8 shadow-sm space-y-8">
          <div>
            <div className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-sm mb-4">
              {currentQuestion.type === "mcq"
                ? isMulti
                  ? "Multiple Choice (chọn nhiều)"
                  : "Multiple Choice"
                : "Written Response"}
            </div>
            <h1 className="text-2xl font-semibold leading-relaxed whitespace-pre-line">
              {currentQuestion.question}
            </h1>
          </div>

          {currentQuestion.type === "mcq" ? (
            <div className="grid gap-3">
              {currentQuestion.options.map((option) => {
                const selected = isMulti
                  ? Array.isArray(currentValue) && currentValue.includes(option)
                  : currentValue === option;
                return (
                  <button
                    key={option}
                    onClick={() =>
                      isMulti ? toggleMulti(option) : setAnswer(option)
                    }
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      selected
                        ? "bg-black text-white border-black"
                        : "bg-white hover:border-gray-400"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your response here..."
              className="w-full min-h-[220px] rounded-2xl border p-5 text-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}

          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={current === 0}
              className="px-6 py-3 rounded-2xl border disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              className="px-6 py-3 rounded-2xl bg-black text-white"
            >
              {current === quiz.length - 1 ? "Submit Exam" : "Next Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
