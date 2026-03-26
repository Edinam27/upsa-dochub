import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const generatePDFBlob = async (text: string, title: string = 'Document'): Promise<Blob> => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    let y = 10;
    
    // Add simple header
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`OCR Result for: ${title}`, 10, y);
    y += 10;

    // Add content
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
        doc.text(splitText[i], 10, y);
        y += 7;
    }

    return doc.output('blob');
};

export const generateDOCXBlob = async (text: string): Promise<Blob> => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: text.split('\n').map(line => 
                new Paragraph({
                    children: [new TextRun(line)],
                    spacing: { after: 120 }
                })
            ),
        }],
    });

    return await Packer.toBlob(doc);
};

export const generateTextBlob = (text: string): Blob => {
    return new Blob([text], { type: 'text/plain' });
};
