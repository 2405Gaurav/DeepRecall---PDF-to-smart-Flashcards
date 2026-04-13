/**
 * lib/pdf.ts — PDF text extraction using unpdf
 *
 * unpdf is a modern, Vercel/Edge-compatible PDF library built on top of
 * Mozilla's pdfjs-dist. It works without workers, canvas, or filesystem
 * access — perfect for Next.js serverless functions.
 *
 * API: extractText(uint8array, { mergePages: true }) → { text: string }
 *
 * Falls back to a pure-Node zlib stream parser if unpdf can't extract
 * enough text (e.g. heavily custom-encoded fonts).
 */

import { inflateSync } from 'zlib';

// ─── zlib fallback: decompress FlateDecode streams and parse text operators ───

function decompressAndExtract(buffer: Buffer): string {
  const raw = buffer.toString('binary');
  const chunks: string[] = [];

  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m: RegExpExecArray | null;

  while ((m = streamRe.exec(raw)) !== null) {
    const streamBuf = Buffer.from(m[1], 'binary');
    let decompressed = '';
    try {
      decompressed = inflateSync(streamBuf).toString('latin1');
    } catch {
      decompressed = m[1]; // not compressed — try raw
    }
    extractFromStream(decompressed, chunks);
  }

  return chunks.join(' ');
}

function extractFromStream(content: string, out: string[]): void {
  const btRe = /BT\s([\s\S]*?)\s*ET/g;
  let m: RegExpExecArray | null;

  while ((m = btRe.exec(content)) !== null) {
    const block = m[1];

    // (text) Tj / ' / "
    const tjRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*(?:Tj|\'|\")/g;
    let tm: RegExpExecArray | null;
    while ((tm = tjRe.exec(block)) !== null) {
      const t = decodePdfString(tm[1]);
      if (t.length >= 2) out.push(t);
    }

    // [(text)(text2) ...] TJ
    const tjArrRe = /\[([\s\S]*?)\]\s*TJ/g;
    while ((tm = tjArrRe.exec(block)) !== null) {
      const strRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
      let sm: RegExpExecArray | null;
      let word = '';
      while ((sm = strRe.exec(tm[1])) !== null) {
        word += decodePdfString(sm[1]);
      }
      if (word.length >= 2) out.push(word);
    }

    // <hex> Tj/TJ
    const hexRe = /<([0-9A-Fa-f]+)>\s*(?:Tj|TJ|\'|\")/g;
    while ((tm = hexRe.exec(block)) !== null) {
      let decoded = '';
      const hex = tm[1];
      for (let i = 0; i < hex.length - 1; i += 2) {
        const code = parseInt(hex.slice(i, i + 2), 16);
        if (code >= 0x20 && code <= 0x7e) decoded += String.fromCharCode(code);
      }
      if (decoded.length >= 2) out.push(decoded);
    }
  }
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\(.)/g, '$1')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .trim();
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let text = '';
  let primaryError: string | null = null;

  // ── Attempt 1: unpdf (pdfjs-dist based, Vercel-safe, no workers) ──────────
  try {
    const { extractText } = await import('unpdf');
    // unpdf requires Uint8Array, not Buffer
    const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const result = await extractText(uint8, { mergePages: true });
    text = result.text ?? '';
  } catch (err) {
    primaryError = err instanceof Error ? err.message : String(err);
    console.error('[pdf.ts] unpdf attempt failed:', primaryError);
    text = '';
  }

  // ── Attempt 2: zlib-decompressed raw stream parser ────────────────────────
  if (text.replace(/\s+/g, '').length < 100) {
    console.log('[pdf.ts] unpdf gave insufficient text, trying zlib fallback…');
    try {
      const raw = decompressAndExtract(buffer);
      if (raw.replace(/\s+/g, '').length > text.replace(/\s+/g, '').length) {
        console.log('[pdf.ts] zlib fallback extracted', raw.length, 'chars');
        text = raw;
      }
    } catch (zlibErr) {
      console.error('[pdf.ts] zlib fallback failed:', zlibErr);
    }
  }

  // normalise whitespace
  text = text
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  console.log(
    `[pdf.ts] buffer=${buffer.length}B | final=${text.length} chars | preview="${text.slice(0, 80)}"`
  );

  if (text.replace(/\s+/g, '').length < 20) {
    const detail = primaryError ? ` (unpdf: ${primaryError.slice(0, 150)})` : '';
    throw new Error(
      `Extracted only ${text.length} chars from ${buffer.length}B PDF — likely image-only or encrypted.${detail}`
    );
  }

  if (text.length > 20_000) {
    text = text.substring(0, 20_000);
  }

  return text;
}
