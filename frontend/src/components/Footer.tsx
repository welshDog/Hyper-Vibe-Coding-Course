import { Link } from 'react-router-dom';
import { HVZBrand, HVZTag } from './ui/hvz';

type Col = { heading: string; links: { label: string; href: string; external?: boolean }[] };

const COLS: Col[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'BROski$Pets', href: '/pets' },
      { label: 'Pricing', href: '/pricing' },
      // Hidden until Quests is populated (2026-06-19) — /quests route still live.
      // { label: 'Quests', href: '/quests' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'GitHub', href: 'https://github.com/welshDog/Hyper-Vibe-Coding-Course', external: true },
      { label: 'Tokens', href: '/tokens' },
      { label: 'Shop', href: '/shop' },
    ],
  },
  {
    heading: 'Brand',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Made in Wales', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="border-t border-hfz-border-violet"
      style={{ background: '#070912' }}
    >
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-12">
          <div className="max-w-[40ch]">
            <HVZBrand size="md" />
            <p className="mt-4 text-[15px] leading-[1.8] text-hfz-text-secondary">
              Built in Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿 by @welshDog. For brains that build differently.
            </p>
            <div className="mt-5 flex gap-2 flex-wrap">
              <HVZTag color="cyan">v0.9 · Beta</HVZTag>
              <HVZTag color="mint">● All systems green</HVZTag>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-[11px] font-bold text-hfz-violet-light uppercase tracking-hfz-caps mb-4">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external || link.href === '#' ? (
                      <a
                        href={link.href}
                        className="text-[15px] text-hfz-text-primary/75 hover:text-hfz-cyan transition-colors no-underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-[15px] text-hfz-text-primary/75 hover:text-hfz-cyan transition-colors no-underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-hfz-border-violet flex justify-between items-center flex-wrap gap-4">
          <div className="text-[13px] text-hfz-text-secondary">
            © {new Date().getFullYear()} HyperFocus Z0ne · Keep it{' '}
            <Link
              to="/admin/mission-control"
              className="text-hfz-text-secondary hover:text-hfz-cyan transition-colors no-underline"
              title=""
            >
              weird
            </Link>
            , keep it Welsh.
          </div>
          <div className="font-mono text-xs text-hfz-violet-light tracking-hfz-caps">
            ENTER · THE · Z0NE
          </div>
        </div>
      </div>
    </footer>
  );
}
