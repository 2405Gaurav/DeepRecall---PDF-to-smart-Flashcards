import Link from 'next/link';

const COLS = [
  {
    title: 'ABOUT',
    links: [
      ['About this service', '/#about-service'],
      ['DeepRecall habits', '/#how-it-works'],
      ['FAQs', '/#faq'],
    ],
  },
  {
    title: 'STUDIO',
    links: [
      ['Your studio', '/studio'],
      ['Create flashcards', '/studio'],
      ['How uploads work', '/#how-it-works'],
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      ['How it works', '/#how-it-works'],
      ['Study tips', '/#faq'],
      ['Cuemath', 'https://www.cuemath.com'],
    ],
  },
  {
    title: 'LEGAL',
    links: [
      ['Terms (placeholder)', '#'],
      ['Privacy (placeholder)', '#'],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-lab-line bg-lab-bg/95">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-xs font-bold tracking-wider text-lab-teal-dark">{col.title}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('http') ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-lab-soft transition hover:text-lab-teal-dark"
                      >
                        {label}
                      </a>
                    ) : href.startsWith('/') ? (
                      <Link href={href} className="text-sm text-lab-soft transition hover:text-lab-teal-dark">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="text-sm text-lab-soft transition hover:text-lab-teal-dark">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-lab-line pt-10 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-bold text-lab-teal-dark">CUEMATH</p>
            <p className="mt-1 text-sm text-lab-soft">DeepRecall flashcard lab — personal progress & analytics</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-lab-soft">
            <span>© {new Date().getFullYear()} Practice project · Not affiliated with Cuemath Inc.</span>
            <Link href="/" className="underline hover:text-lab-teal-dark">
              Home
            </Link>
            <Link href="/studio" className="underline hover:text-lab-teal-dark">
              Studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
