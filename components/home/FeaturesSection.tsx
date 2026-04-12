import { motion } from 'framer-motion';
import { Trophy, Handshake, Target, Sparkles } from 'lucide-react';

export function FeaturesSection() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:grid-cols-3 sm:gap-6 sm:px-6 md:py-20" id="how-it-works">
        {[
          {
            title: 'TOP 1% STUDY DESIGN',
            body: 'Cards emphasize concepts, definitions, relationships, and examples — not shallow trivia.',
            Icon: Trophy,
            bg: 'bg-lab-mint/90',
            iconClass: 'text-lab-teal-dark',
          },
          {
            title: 'FOR THE LONG TERM',
            body: 'Spaced repetition brings back tough cards and fades what you already know.',
            Icon: Handshake,
            bg: 'bg-lab-lilac/80',
            iconClass: 'text-violet-600',
          },
          {
            title: 'PERFECT MATCH',
            body: 'Bring your own PDFs — every deck and stat is tied to your account.',
            Icon: Target,
            bg: 'bg-lab-sand/90',
            iconClass: 'text-lab-coral',
          },
        ].map(({ title, body, Icon, bg, iconClass }, i) => (
          <motion.article
            key={title}
            className={`relative overflow-hidden rounded-2xl border border-lab-line/80 ${bg} p-7 pt-12 shadow-sm md:p-8 md:pt-14 cursor-pointer`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -6,
              scale: 1.02,
              rotate: i % 2 === 0 ? 1 : -1,
              transition: { type: 'spring', stiffness: 380, damping: 22 },
            }}
          >
            <motion.div
              className={`absolute right-5 top-5`}
              animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            >
              <Icon className={`h-11 w-11 md:h-12 md:w-12 ${iconClass}`} aria-hidden />
            </motion.div>
            <h2 className="font-display text-sm font-bold tracking-wide text-lab-teal-dark md:text-base">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-lab-soft md:text-lg">{body}</p>
          </motion.article>
        ))}
      </section>

      <section id="about-service" className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex gap-4 rounded-2xl border border-lab-line bg-white/90 p-6 shadow-sm md:p-8">
          <Sparkles className="mt-1 h-7 w-7 shrink-0 text-lab-coral" aria-hidden />
          <div>
            <h2 className="font-display text-base font-bold text-lab-teal-dark md:text-lg">DeepRecall Flashcard Lab</h2>
            <p className="mt-3 text-base leading-relaxed text-lab-soft md:text-lg">
              Built by Cuemath, with a <strong className="text-lab-ink">distinct teal & coral</strong> palette for
              calmer study sessions. Sign up once, then use <strong>Your studio</strong>{' '}
              to upload PDFs, review cards, and see your growth over time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
