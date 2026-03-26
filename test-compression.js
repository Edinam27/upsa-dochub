
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function testCompression() {
    const inputPath = 'c:/Users/eddyi/Desktop/code/upsa pdf solution/75 mB sample pdf file  _rasterized.pdf';
    
    if (!fs.existsSync(inputPath)) {
        console.error('File not found:', inputPath);
        return;
    }

    const originalBuffer = fs.readFileSync(inputPath);
    const originalSize = originalBuffer.length;
    console.log(`Original Size: ${originalSize} bytes (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);

    try {
        const pdfDoc = await PDFDocument.load(originalBuffer);
        const pageCount = pdfDoc.getPageCount();
        console.log(`Page Count: ${pageCount}`);

        if (pageCount > 35) {
            console.log('WARNING: File exceeds 35 page limit imposed by CompressPDFTool!');
        }

        // Simulate "Medium" compression settings from PDFCompressor
        // Strategy: content-optimization
        // NOTE: The actual app uses "rasterization" (converting pages to images) for "Extreme" and "Grayscale" modes.
        // This test script only verifies structural compression (removing metadata, object streams).
        // Rasterization cannot be easily simulated in Node.js without canvas dependencies.
        // Therefore, this test result (likely 0% reduction for already optimized files) confirms that structural compression is ineffective.
        // If the app uses rasterization, it might achieve higher reduction, but if < 6%, the UI will still block it.
        
        // Remove metadata (as done in applyMetadataRemoval)
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        console.log('Compressing with useObjectStreams: true (Structural Compression)...');
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
        });

        const newSize = compressedBytes.length;
        console.log(`Compressed Size: ${newSize} bytes (${(newSize / 1024 / 1024).toFixed(2)} MB)`);

        const reduction = originalSize > 0 ? (originalSize - newSize) / originalSize : 0;
        console.log(`Reduction: ${(reduction * 100).toFixed(2)}%`);

        if (reduction < 0.06) {
            console.log('Result: Ineffective compression (< 6% reduction). UI should block download.');
        } else {
            console.log('Result: Effective compression (>= 6% reduction). UI should allow download.');
        }

    } catch (error) {
        console.error('Compression failed:', error);
    }
}

testCompression();
