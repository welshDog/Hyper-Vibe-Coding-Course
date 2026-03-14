import { Link } from "react-router-dom";

const outcomes = [
  "Build and deploy a full stack app with auth, DB, and payments",
  "Wire Supabase auth + Stripe checkout using the Hyper Vibe stack",
  "Deploy live to Vercel with env vars, Docker local dev, and React Router 7",
];

const tags = ["React 19", "TypeScript", "Supabase", "Stripe", "Vercel", "React Router 7"];

export default function ShipFullStackThing() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-16 max-w-3xl mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
        ⚡ Leveling Up+ · 14h · Medium–High Cognitive Load
      </span>
      <h1 className="mt-3 text-4xl font-black leading-tight">
        Ship Your First Full Stack Thing
      </h1>
      <p className="mt-2 text-orange-300 text-lg font-semibold">
        One brain, one weekend, one deployable app
      </p>
      <p className="mt-4 text-gray-400 text-lg">
        No 60-hour bootcamp. Just enough React + Supabase to ship something
        real, brag-worthy, and live on the internet by Sunday. Built for
        chaotic good devs.
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-orange-900/50 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full"
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
              <span className="text-orange-400 mt-1">▸</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex items-center justify-between">
        <span className="text-3xl font-black text-white">£49.99</span>
        <Link
          to="/register"
          className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-6 py-3 rounded-xl transition"
        >
          Start This Track →
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-600">
        7 × 2h focus blocks · Forged in the fires of hyperfocus by WelshDog
      </p>
    </main>
  );
}
