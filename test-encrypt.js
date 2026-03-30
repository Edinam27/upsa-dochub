const { PDFDocument } = require('pdf-lib');

async function test() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('You can only see this if you know the password!');
  
  if (typeof pdfDoc.encrypt === 'function') {
    console.log('Encrypt method exists!');
  } else {
    console.log('Encrypt method DOES NOT exist.');
  }
}

test();
