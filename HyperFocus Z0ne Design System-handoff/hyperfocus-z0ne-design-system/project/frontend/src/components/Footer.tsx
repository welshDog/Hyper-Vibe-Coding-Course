import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* Top — Logo + tagline */}
        <div className="mb-10 text-center">
          <span className="text-2xl font-bold text-purple-400">Hyper Vibe Z0ne</span>
          <p className="mt-2 text-sm text-gray-500">
            Built in Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿 by @welshDog. For brains that build differently.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            v0.9 · Beta&nbsp;&nbsp;●&nbsp;&nbsp;All systems green
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/courses" className="hover:text-purple-400 transition-colors text-sm">Courses</Link></li>
              <li><Link to="/vibe-labs" className="hover:text-purple-400 transition-colors text-sm">Vibe Labs</Link></li>
              <li><Link to="/pricing" className="hover:text-purple-400 transition-colors text-sm">Pricing</Link></li>
              <li><Link to="/quests" className="hover:text-purple-400 transition-colors text-sm">Quests</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">Community</h3>
            <ul className="space-y-3">
              <li><Link to="/leaderboard" className="hover:text-purple-400 transition-colors text-sm">Leaderboard</Link></li>
              <li>
                <a
                  href="https://github.com/welshDog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
              <li><Link to="/tokens" className="hover:text-purple-400 transition-colors text-sm">Tokens</Link></li>
              <li><Link to="/shop" className="hover:text-purple-400 transition-colors text-sm">Shop</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">Brand</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="hover:text-purple-400 transition-colors text-sm">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-purple-400 transition-colors text-sm">Terms</Link></li>
              <li>
                <a
                  href="https://github.com/welshDog/Hyper-Vibe-Coding-Course"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors text-sm"
                >
                  Made in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">Start Here</h3>
            <ul className="space-y-3">
              <li><Link to="/register" className="hover:text-purple-400 transition-colors text-sm">Join Free</Link></li>
              <li><Link to="/vibe-labs/level-1" className="hover:text-purple-400 transition-colors text-sm">Level 1 Lab</Link></li>
              <li><Link to="/feedback" className="hover:text-purple-400 transition-colors text-sm">Give Feedback</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} HyperFocus Z0ne · Keep it weird, keep it Welsh.
          </p>
          <p className="text-xs font-mono tracking-widest text-purple-800">
            ENTER · THE · Z0NE
          </p>
        </div>

      </div>
    </footer>
  );
}
