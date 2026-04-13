/**
 * lib/pdf.ts — PDF text extraction with Vercel-safe fallback
 *
 * pdf-parse@2.4.5 uses a class-based API: new PDFParse({ data }) → getText()
 * On Vercel, when pdf-parse fails (workers, native module issues), we fall back
 * to a pure-JS raw text extraction from the PDF binary stream.
 */

/** Raw fallback: extract visible text strings from PDF binary without any library */
function rawExtractFromPdf(buffer: Buffer): string {
  const content = buffer.toString('latin1'); // latin1 preserves byte values
  const chunks: string[] = [];

  // Match text in PDF stream operators: (text)Tj  [(text)]TJ  (text)Td etc.
  const bracketRe = /\(([^)\\]{3,})\)\s*(?:Tj|TJ|Td|TD|T\*|Tf|\'|\")/g;
  let m: RegExpExecArray | null;
  while ((m = bracketRe.exec(content)) !== null) {
    const t = m[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\\/g, '\\')
      .replace(/\\([()\\])/g, '$1')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .trim();
    if (t.length >= 3) chunks.push(t);
  }

  // Also grab BT...ET text block contents for hex strings
  const btRe = /BT\s([\s\S]*?)\sET/g;
  while ((m = btRe.exec(content)) !== null) {
    const block = m[1];
    const hexRe = /<([0-9A-Fa-f]{4,})>/g;
    let hm: RegExpExecArray | null;
    while ((hm = hexRe.exec(block)) !== null) {
      const hex = hm[1];
      let decoded = '';
      for (let i = 0; i < hex.length - 1; i += 2) {
        const code = parseInt(hex.slice(i, i + 2), 16);
        if (code >= 0x20 && code <= 0x7e) decoded += String.fromCharCode(code);
      }
      if (decoded.length >= 3) chunks.push(decoded);
    }
  }

  return chunks.join(' ').replace(/\s{2,}/g, ' ').trim();
}

type PdfTextResult = { text?: string; pages?: unknown[]; total?: number };

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let text = '';
  let primaryError: string | null = null;

  // ── Attempt 1: pdf-parse@2.x class API ──
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer }) as unknown as {
      getText: () => Promise<PdfTextResult>;
      destroy: () => Promise<void>;
    };
    const result = await parser.getText();
    if (typeof result === 'string') {
      text = result;
    } else if (result && typeof result.text === 'string') {
      text = result.text;
    }
    try { await parser.destroy(); } catch { /* non-fatal */ }
  } catch (err) {
    primaryError = err instanceof Error ? err.message : String(err);
    console.error('[pdf.ts] PDFParse attempt failed:', primaryError);
    text = '';
  }

  // ── Attempt 2: raw stream extraction fallback ──
  if (text.trim().length < 50) {
    const raw = rawExtractFromPdf(buffer);
    if (raw.length > text.trim().length) {
      console.log('[pdf.ts] Using raw fallback — extracted', raw.length, 'chars');
      text = raw;
    }
  }

  // normalise whitespace
  text = text
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  if (text.length < 30) {
    const detail = primaryError ? ` (${primaryError})` : '';
    throw new Error(
      `Could not extract enough text. The PDF may be image-only or encrypted.${detail}`
    );
  }

  if (text.length > 20_000) {
    text = text.substring(0, 20_000);
  }

  return text;
}
