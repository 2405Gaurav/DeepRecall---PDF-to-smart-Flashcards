/**
 * lib/pdf.ts — PDF text extraction
 *
 * Uses the installed pdf-parse package which exports a PDFParse class.
 * The class has a private `load()` method followed by `getText()`.
 * We call load via type-escape (cast to any) because the types mark it
 * private but it is a real public runtime method required before getText().
 *
 * Root cause of the Vercel 400: getText() silently returns null/empty when
 * load() hasn't been called first, because the PDF hasn't been parsed yet.
 */

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parser = new PDFParse({ data: buffer }) as any;

  let text = '';
  try {
    // load() MUST run before getText() — it parses the PDF buffer.
    // The type declarations mark it private but it is a real public runtime method.
    if (typeof parser.load === 'function') {
      await parser.load();
    }

    const result = await parser.getText();

    // getText() can return a string or an object with a .text property
    if (typeof result === 'string') {
      text = result;
    } else if (result && typeof result === 'object') {
      text = (result.text as string) ?? '';
    }
  } finally {
    try {
      if (typeof parser.destroy === 'function') await parser.destroy();
    } catch { /* cleanup errors are non-fatal */ }
  }

  // normalise whitespace — collapse 3+ spaces / blank lines, strip control chars
  text = text
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  if (text.length < 50) {
    throw new Error(
      'Could not extract enough text. The PDF may be image-only or encrypted.'
    );
  }

  // cap at 20 000 chars to stay within Gemini's context window
  if (text.length > 20_000) {
    text = text.substring(0, 20_000);
  }

  return text;
}
