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
  few: { min: 6, max: 12, label: 'about 6–12' },
  normal: { min: 15, max: 28, label: 'about 15–28' },
  many: { min: 30, max: 50, label: 'about 30–50' },
};

function buildPrompt(pdfText: string, preset: CardCountPreset = 'normal'): string {
  const { min, max, label } = PRESET_RANGES[preset];
  return `You are an expert teacher creating revision flashcards for long-term retention (active recall, not passive recognition).

SOURCE TEXT (only use information from here; do not invent facts):
---
${pdfText}
---

TASK:
Create ${label} high-quality flashcards (${min}–${max} cards) that comprehensively cover the material.

QUALITY BAR:
- Cover: key concepts, precise definitions, relationships (cause/effect, compare/contrast), edge cases, and worked examples where the source includes them.
- Questions must require recall or explanation, not "What is the title of section 3?" style recognition.
- Answers: concise but complete (typically 1–4 short sentences). No fluff.
- Avoid duplicate or near-duplicate questions, vague prompts, and trivial filler.

STRICT OUTPUT:
Return ONLY a valid JSON array. No markdown, no code fences, no commentary.
Each item must be exactly:
{ "question": string, "answer": string, "type": "concept" | "definition" | "example" }

Use "definition" for term-meaning cards, "example" for concrete instances, "concept" for principles and relationships.`;
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

async function callModelOnce(pdfText: string, preset: CardCountPreset): Promise<RawFlashcard[]> {
  const { max } = PRESET_RANGES[preset];
  const model = genAI.getGenerativeModel({ model: MODEL });
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
    const q = o.question;
    const a = o.answer;
    const typ = o.type;
    if (typeof q !== 'string' || typeof a !== 'string') continue;
    if (!q.trim() || !a.trim()) continue;
    flashcards.push({
      question: q.trim(),
      answer: a.trim(),
      type: typeof typ === 'string' ? typ : undefined,
    });
  }
  const floor: Record<CardCountPreset, number> = { few: 5, normal: 8, many: 12 };
  if (flashcards.length < floor[preset]) {
    throw new Error('Too few valid flashcards in model output');
  }
  return dedupeByQuestion(flashcards).slice(0, max);
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
    console.warn('Gemini first attempt failed, retrying once:', first);
    try {
      return await callModelOnce(limited, preset);
    } catch (second) {
      const msg = second instanceof Error ? second.message : 'Unknown error';
      throw new Error(`Flashcard generation failed after retry: ${msg}`);
    }
  }
}

export { normalizeCardType };
