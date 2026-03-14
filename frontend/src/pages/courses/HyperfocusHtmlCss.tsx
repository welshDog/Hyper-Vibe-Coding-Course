import { Link } from "react-router-dom";

const outcomes = [
  "Build a personal Brain Lab landing page",
  "Create a product showcase page from scratch",
  "Ship a styled Now page with CSS variables & custom props",
];

const tags = ["HTML5", "CSS3", "Flexbox", "Grid", "Animations"];

export default function HyperfocusHtmlCss() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-16 max-w-3xl mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
        ⚡ Booting Up · 6h · Low Cognitive Load
      </span>
      <h1 className="mt-3 text-4xl font-black leading-tight">
        Hyperfocus HTML &amp; CSS Quick Wins
      </h1>
      <p className="mt-4 text-gray-400 text-lg">
        For days when tutorials feel too long. Short, spicy builds for brains
        that bounce — ship 3 real pages in 3 focused 2h sessions.
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-emerald-900/50 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full"
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
              <span className="text-emerald-400 mt-1">▸</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex items-center justify-between">
        <span className="text-3xl font-black text-white">£19.99</span>
        <Link
          to="/register"
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition"
        >
          Start This Track →
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-600">
        3 × 2h focus blocks · Forged in the fires of hyperfocus by WelshDog
      </p>
    </main>
  );
}
