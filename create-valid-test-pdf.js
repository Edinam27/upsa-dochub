// Create a valid PDF file for testing using pdf-lib
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

async function createTestPDF() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page
    const page = pdfDoc.addPage([600, 400]);
    
    // Add some text
    page.drawText('Test PDF for Extract Pages Tool', {
      x: 50,
      y: 350,
      size: 20,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('This is page 1 of the test document.', {
      x: 50,
      y: 300,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    // Add a second page
    const page2 = pdfDoc.addPage([600, 400]);
    page2.drawText('This is page 2 of the test document.', {
      x: 50,
      y: 350,
      size: 12,
      color: rgb(0, 0, 0),
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('valid-test.pdf', pdfBytes);
    
    console.log('Valid test PDF created: valid-test.pdf');
    console.log('PDF size:', pdfBytes.length, 'bytes');
  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}

createTestPDF();