import { GoogleGenerativeAI } from '@google/generative-ai';
import { CardType } from '@prisma/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface RawFlashcard {
  question: string;
  answer: string;
  type?: string;
}

const MAX_INPUT_CHARS = 20_000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type CardCountPreset = 'few' | 'normal' | 'many';

const PRESET_RANGES: Record<CardCountPreset, { min: number; max: number; label: string }> = {
  few: { min: 8, max: 12, label: '8–12' },
  normal: { min: 18, max: 28, label: '18–28' },
  many: { min: 35, max: 50, label: '35–50' },
};

const SYSTEM_PROMPT = `You are an exceptional teacher who has spent 20 years creating study materials. You understand that the best flashcards do not test recall of words — they test understanding of ideas. You never copy sentences from the source. You rewrite everything as a question that forces the student to think.`;

function buildPrompt(pdfText: string, preset: CardCountPreset = 'normal'): string {
  const { min, max, label } = PRESET_RANGES[preset];
  return `Here is the source text:
---
${pdfText}
---

Generate flashcards using ALL of the following card types. Do not skip any type:

TYPE 1 — CONCEPT DEFINITION
Ask for the meaning of a key term in a way that requires understanding, not memorization.
Example front: 'What makes a quadratic equation different from a linear one — and why does that difference matter?'
Example back: 'A quadratic has a squared term (x²), which means the relationship curves instead of going straight. This creates two possible solutions instead of one.'

TYPE 2 — WHY DOES THIS WORK
Ask the student to explain the reasoning behind a fact or process.
Example front: 'Why does multiplying two negative numbers give a positive result?'
Example back: 'Negation reverses direction. Reversing direction twice brings you back to positive. Think of it as: opposite of opposite = original.'

TYPE 3 — COMMON MISCONCEPTION
State a wrong belief a student might have and ask them to correct it.
Example front: 'A student says the French Revolution ended when the Bastille was stormed in 1789. What is wrong with this?'
Example back: 'The storming of the Bastille was the beginning, not the end. The Revolution lasted until 1799, going through multiple phases including the Reign of Terror and the rise of Napoleon.'

TYPE 4 — WORKED EXAMPLE
Give a problem and ask for a step-by-step solution, or give the solution and ask what each step means.
Example front: 'Solve x² - 5x + 6 = 0 using factoring. Show each step and explain why it works.'
Example back: 'Factor into (x-2)(x-3)=0. Set each factor to zero: x=2 or x=3. This works because if either factor is zero, the product must be zero.'

TYPE 5 — RELATIONSHIP
Ask how two concepts connect, contrast, or depend on each other.
Example front: 'How does the concept of supply relate to price in a free market — and what breaks that relationship?'
Example back: 'Higher price → more supply (profitable to produce more). The relationship breaks when supply is fixed (like land) or when monopolies control pricing.'

TYPE 6 — EDGE CASE
Ask what happens in an unusual or boundary situation.
Example front: 'What happens when you try to find the square root of a negative number in standard algebra?'
Example back: 'It is undefined in real numbers. This is why imaginary numbers (i) were invented — to extend math into cases standard algebra cannot handle.'

TYPE 7 — RECALL WITH CONTEXT
Ask a factual question but require the student to explain significance, not just state the fact.
Example front: 'When did World War I end — and why does the exact date matter historically?'
Example back: 'November 11, 1918 at 11am. The precise timing was symbolic, chosen deliberately. The terms of the armistice, especially war guilt clauses, directly planted the seeds for World War II.'

Rules:
- Generate at least 2 cards of each type if the content supports it
- Target ${label} cards total (minimum ${min}, maximum ${max})
- Never copy a sentence from the source text verbatim — always reframe as a question
- Every back must include either an example, an analogy, or a reason — never just restate the front
- Cards must be self-contained — a student should understand them without reading the source
- Front must be a question or a prompt, never a statement
- Back must be concise but complete — 2 to 4 sentences maximum
- Use "question" and "answer" as JSON keys

Return ONLY a valid JSON array, no markdown, no backticks, no explanation:
[{"question": "...", "answer": "...", "type": "concept" | "definition" | "example"}]`;
}

function extractJsonArray(text: string): unknown {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  return JSON.parse(jsonMatch[0]);
}

function normalizeCardType(raw: string | undefined): CardType {
  const t = (raw || 'concept').toLowerCase().trim();
  if (t === 'definition') return CardType.DEFINITION;
  if (t === 'example') return CardType.EXAMPLE;
  return CardType.CONCEPT;
}

function dedupeByQuestion(cards: RawFlashcard[]): RawFlashcard[] {
  const seen = new Set<string>();
  const out: RawFlashcard[] = [];
  for (const c of cards) {
    const key = c.question.trim().toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

/** Quality filter — removes vague/shallow cards */
function qualityFilter(cards: RawFlashcard[]): { passed: RawFlashcard[]; total: number } {
  const total = cards.length;
  const hasVerb = /\b(is|are|was|were|do|does|did|can|could|will|would|should|have|has|had|how|why|what|when|where|which|explain|describe|compare|contrast|solve|find|calculate|define|identify|list|name|give|show|prove|determine|evaluate|analyze|discuss)\b/i;

  const passed = cards.filter((c) => {
    // front too short = vague question
    if (c.question.length < 20) return false;
    // back too short = shallow answer
    if (c.answer.length < 40) return false;
    // front should be a real question (ends with ? or contains a verb)
    const endsWithQ = c.question.trim().endsWith('?');
    const containsVerb = hasVerb.test(c.question);
    if (!endsWithQ && !containsVerb) return false;
    return true;
  });

  console.log(`[gemini] Quality filter: ${passed.length}/${total} cards passed`);
  return { passed, total };
}

async function callModelOnce(pdfText: string, preset: CardCountPreset): Promise<RawFlashcard[]> {
  const { max } = PRESET_RANGES[preset];
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await model.generateContent(buildPrompt(pdfText, preset));
  const response = await result.response;
  const text = response.text().trim();
  const parsed = extractJsonArray(text);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini did not return a JSON array');
  }
  const flashcards: RawFlashcard[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    // support both "question"/"answer" and "front"/"back" keys
    const q = (o.question ?? o.front) as string | undefined;
    const a = (o.answer ?? o.back) as string | undefined;
    const typ = o.type;
    if (typeof q !== 'string' || typeof a !== 'string') continue;
    if (!q.trim() || !a.trim()) continue;
    flashcards.push({
      question: q.trim(),
      answer: a.trim(),
      type: typeof typ === 'string' ? typ : undefined,
    });
  }

  const deduped = dedupeByQuestion(flashcards);
  const { passed, total } = qualityFilter(deduped);

  // if too few cards pass quality filter, throw to trigger retry
  const floor: Record<CardCountPreset, number> = { few: 5, normal: 8, many: 12 };
  if (passed.length < floor[preset]) {
    throw new Error(`Only ${passed.length}/${total} cards passed quality filter (need ${floor[preset]})`);
  }

  return passed.slice(0, max);
}

export async function generateFlashcards(
  fullText: string,
  preset: CardCountPreset = 'normal'
): Promise<RawFlashcard[]> {
  const trimmed = fullText.replace(/\s{3,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const limited = trimmed.length > MAX_INPUT_CHARS ? trimmed.slice(0, MAX_INPUT_CHARS) : trimmed;

  try {
    return await callModelOnce(limited, preset);
  } catch (first) {
    console.warn('[gemini] First attempt failed, retrying once:', first);
    try {
      return await callModelOnce(limited, preset);
    } catch (second) {
      const msg = second instanceof Error ? second.message : 'Unknown error';
      throw new Error(`Flashcard generation failed after retry: ${msg}`);
    }
  }
}

export { normalizeCardType };
