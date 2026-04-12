'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Table2, MonitorSmartphone, LineChart } from 'lucide-react';

const features = [
  {
    title: 'Decks & spaced review',
    body: 'Turn PDFs into structured cards with ease scores and review history — like a tiny database for your course.',
    Icon: Table2,
    active: true,
  },
  {
    title: 'Studio on any device',
    body: 'Open your lab in the browser, review between classes, and pick up where you left off.',
    Icon: MonitorSmartphone,
    active: false,
  },
  {
    title: 'Your progress, yours',
    body: 'Per-deck stats and growth charts stay tied to your login — no anonymous drift.',
    Icon: LineChart,
    active: false,
  },
] as const;

function Tag({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function CueFlashcardSection() {
  return (
    <section
      id="cue-flashcard"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 md:py-20"
      aria-labelledby="cue-flashcard-heading"
    >
      <div className="overflow-hidden rounded-3xl border border-lab-line/90 bg-white/90 shadow-sm">
        <div className="grid gap-10 p-8 md:grid-cols-2 md:gap-12 md:p-12 lg:gap-16">
          <motion.div
            className="relative min-h-[280px] md:min-h-[340px]"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 rounded-2xl bg-slate-100/90" />
            <div className="relative p-4 md:p-6">
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2">
                  <p className="text-xs font-bold text-slate-700">Algebra deck · 24 cards</p>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full min-w-[280px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2">Front</th>
                        <th className="px-3 py-2">Back</th>
                        <th className="px-3 py-2">Ease</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { f: 'Quadratic formula', b: 'x = …', e: '2.5', row: 'bg-emerald-50/80' },
                        { f: 'Vertex form', b: 'y = a(x-h)²+k', e: '2.3', row: 'bg-amber-50/70' },
                        { f: 'Discriminant', b: 'b² − 4ac', e: '2.1', row: 'bg-orange-50/70' },
                      ].map((row) => (
                        <tr key={row.f} className={`border-b border-slate-50 ${row.row}`}>
                          <td className="px-3 py-2 font-medium text-slate-800">{row.f}</td>
                          <td className="px-3 py-2 text-slate-600">{row.b}</td>
                          <td className="px-3 py-2 text-slate-600">{row.e}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="absolute bottom-2 right-2 w-[min(100%,18rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:bottom-4 md:right-4 md:w-[20rem]">
                <p className="text-[11px] font-bold text-slate-800">Step 1 · Study tracker</p>
                <ul className="mt-2 space-y-2 text-[10px]">
                  <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span aria-hidden>📘</span> Chapter 4 PDF
                    </span>
                    <Tag className="bg-amber-100 text-amber-800">In progress</Tag>
                  </li>
                  <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span aria-hidden>▶️</span> Video set
                    </span>
                    <Tag className="bg-emerald-100 text-emerald-800">Done</Tag>
                  </li>
                  <li className="flex flex-wrap items-center gap-1.5 px-0.5 pt-0.5 text-slate-500">
                    <Tag className="bg-sky-100 text-sky-800">Textbook</Tag>
                    <Tag className="bg-violet-100 text-violet-800">Video</Tag>
                    <Tag className="bg-orange-100 text-orange-800">Mostly done</Tag>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <h2
              id="cue-flashcard-heading"
              className="font-display text-3xl font-bold leading-tight tracking-tight text-lab-ink sm:text-4xl md:text-[2.25rem] md:leading-[1.15]"
            >
              A <span className="text-pink-600">Cue-flashcard</span> lab for your notes
            </h2>
            <p className="mt-4 text-base leading-relaxed text-lab-soft sm:text-lg">
              One place to ingest PDFs, generate cards, and track how you&apos;re improving — with the same calm lab
              feel as the rest of DeepRecall, tuned for daily recall.
            </p>

            <ul className="mt-8 space-y-3">
              {features.map(({ title, body, Icon, active }) => (
                <li
                  key={title}
                  className={`rounded-xl border px-4 py-3 transition-colors ${
                    active
                      ? 'border-slate-200 bg-slate-50/90 shadow-sm'
                      : 'border-transparent bg-transparent hover:border-lab-line/60 hover:bg-white/60'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        active ? 'bg-pink-600 text-white' : 'border-2 border-pink-500 text-pink-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.75} aria-hidden />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-lab-ink md:text-base">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-lab-soft">{body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/studio"
              className="mt-8 inline-flex items-center gap-1 text-base font-bold text-pink-600 transition hover:text-pink-700"
            >
              Try it in your studio <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
