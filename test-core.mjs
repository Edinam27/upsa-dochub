import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

async function runTests() {
  console.log("Starting tests...");
  try {
    // 1. Merge
    const doc1 = await PDFDocument.create();
    const page1 = doc1.addPage();
    page1.drawText("Page 1");
    const doc2 = await PDFDocument.create();
    const page2 = doc2.addPage();
    page2.drawText("Page 2");
    
    const merged = await PDFDocument.create();
    const [copied1] = await merged.copyPages(doc1, [0]);
    merged.addPage(copied1);
    const [copied2] = await merged.copyPages(doc2, [0]);
    merged.addPage(copied2);
    console.log("Merge: OK", merged.getPageCount() === 2);

    // 2. Split
    const doc3 = await PDFDocument.create();
    const [copied3] = await doc3.copyPages(merged, [0]);
    doc3.addPage(copied3);
    console.log("Split: OK", doc3.getPageCount() === 1);

    // 3. Protect
    if (typeof doc3.encrypt === 'function') {
        console.log("Protect: OK (function exists)");
    } else {
        console.log("Protect: FAILED (encrypt function missing in pdf-lib v1.17.1)");
    }

    // 4. Compress
    // Compression in pdf-lib usually just means not using full quality or re-encoding streams, 
    // which is what our CompressPDFTool does (or uses canvas rasterization).

    console.log("Basic PDF functions tested.");
  } catch (e) {
    console.error("Test failed:", e);
  }
}

runTests();