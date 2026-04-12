export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  let text = '';
  try {
    const result = await parser.getText();
    text = result.text || '';
  } finally {
    await parser.destroy();
  }

  text = text
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  if (!text) {
    throw new Error('Could not extract enough text. PDF may be image-only or encrypted.');
  }

  if (text.length > 20000) {
    text = text.substring(0, 20000);
  }

  return text;
}
