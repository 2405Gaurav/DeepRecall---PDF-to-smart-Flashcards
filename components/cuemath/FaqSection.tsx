import { motion } from 'framer-motion';
import { SlideCtaButton, SlideCtaLink } from '@/components/ui/SlideCtaButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = [
  {
    q: 'What is DeepRecall?',
    a: 'A learning lab by Cuemath for long-term memory: PDFs become recall-heavy flashcards (not shallow trivia), practice uses spaced-style scheduling so easy cards fade out and hard ones return sooner, and your profile shows progress across decks.',
  },
  {
    q: 'Where do I create decks?',
    a: 'Sign up or log in, then open Your studio. Uploads are tied to your account so decks are always accessible.',
  },
  {
    q: 'How do I sign up or log in?',
    a: 'Choose a username and password — that\'s it! After signing up, you\'ll fill in your name and grade so we can personalize your experience. Returning users just log in and go straight to the studio.',
  },
  {
    q: 'Which PDFs work best?',
    a: 'Text-based PDFs work well. Image-only scans may not extract enough text.',
  },
  {
    q: 'How do streaks and badges work?',
    a: 'Every day you practice at least one card, your streak goes up by 1. Miss a day and it resets. Hit milestones like 3, 7, 15, or 30 days and you earn a badge — permanently! Your profile keeps a trophy wall of every badge you have collected so far.',
  },
  {
    q: 'What does the spaced repetition algorithm actually do?',
    a: "We use an SM-2 inspired system. When you mark a card as 'mastered,' it won't show again for several days. Cards marked 'still learning' come right back. The intervals grow — 1 day, 3 days, 7 days, 14 days — so you review tough cards more and easy ones less. It's math that helps your brain!",
  },
  {
    q: 'Can I use this on my phone or tablet?',
    a: 'Yes! The app is fully responsive — it works in any modern browser on phones, tablets, and desktops. No app install needed. Just open your studio URL and start practicing anywhere.',
  },
] as const;


type FaqSectionProps = {
  isLoggedIn: boolean;
  openLogin: () => void;
  openSignup: () => void;
};

export function FaqSection({ isLoggedIn, openLogin, openSignup }: FaqSectionProps) {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24">
      <h2 className="text-center font-display text-3xl font-bold text-lab-teal-dark sm:text-4xl md:text-5xl">
        We love solving doubts!
      </h2>
      <Accordion type="single" collapsible className="mt-10 w-full">
        {FAQ.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`} className="border-lab-line">
            <AccordionTrigger className="text-left text-base font-semibold text-lab-teal-dark hover:no-underline md:text-lg">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-base text-lab-soft md:text-lg">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <motion.div
        className="mt-12 flex justify-center gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {isLoggedIn ? (
          <SlideCtaLink href="/studio">Open Studio</SlideCtaLink>
        ) : (
          <>
            <SlideCtaButton onClick={openSignup}>Get Started</SlideCtaButton>
            <button
              onClick={openLogin}
              className="rounded-full border-2 border-lab-teal px-6 py-3 text-sm font-bold text-lab-teal transition hover:bg-lab-teal hover:text-white"
            >
              Log In
            </button>
          </>
        )}
      </motion.div>
    </section>
  );
}
