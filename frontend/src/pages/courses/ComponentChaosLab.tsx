import { Link } from "react-router-dom";

const outcomes = [
  "Build a personal component library of 8-10 reusable UI pieces",
  "Wire shared state across components using Zustand",
  "Document your components so you actually remember them later",
];

const tags = ["React 19", "TypeScript", "Tailwind CSS", "Zustand", "Storybook"];

export default function ComponentChaosLab() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-16 max-w-3xl mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
        ⚡ Leveling Up · 10h · Medium Cognitive Load
      </span>
      <h1 className="mt-3 text-4xl font-black leading-tight">
        Component Chaos Lab
      </h1>
      <p className="mt-2 text-violet-300 text-lg font-semibold">
        React UI in a Weekend
      </p>
      <p className="mt-4 text-gray-400 text-lg">
        Turn your chaos energy into a reusable component library. Build once,
        reuse forever in your weird side-projects and serious apps.
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-violet-900/50 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">🎯 What you will ship</h2>
        <ul className="space-y-2">
          {outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2 text-gray-300">
              <span className="text-violet-400 mt-1">▸</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex items-center justify-between">
        <span className="text-3xl font-black text-white">£39.99</span>
        <Link
          to="/register"
          className="bg-violet-500 hover:bg-violet-400 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          Start This Track →
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-600">
        5 × 2h focus blocks · Forged in the fires of hyperfocus by WelshDog
      </p>
    </main>
  );
}
