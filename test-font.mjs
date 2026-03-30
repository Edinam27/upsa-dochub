import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function run() {
  const buffer = fs.readFileSync('public/valid-test.pdf');
  const data = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  console.log('Styles:', textContent.styles);
  if (textContent.items.length > 0) {
      console.log('First item:', textContent.items[0]);
  }
}
run();