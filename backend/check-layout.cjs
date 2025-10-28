const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfPath = 'C:\\Users\\djain\\Desktop\\MAHAVIR ERP\\pdf\\PickList_PKL6_20251024225716978.pdf';

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => {
  console.error(errData.parserError);
});

pdfParser.on('pdfParser_dataReady', pdfData => {
  // Extract text with position information
  console.log('📄 Analyzing Can 300 - 24 category layout:\n');
  
  const lines = [];
  
  pdfData.Pages.forEach((page, pageNum) => {
    page.Texts.forEach(textItem => {
      textItem.R.forEach(r => {
        const decoded = decodeURIComponent(r.T);
        const y = textItem.y; // Y position
        const x = textItem.x; // X position
        
        // Only show lines containing items from "Can 300" category
        if (decoded.includes('300') || decoded.includes('Can') || 
            decoded.includes('DKO') || decoded.includes('PRE') ||
            decoded.includes('STW') || decoded.includes('Total')) {
          lines.push({ x, y, text: decoded });
        }
      });
    });
  });
  
  // Group by Y position (same line)
  const linesByY = {};
  lines.forEach(item => {
    const yKey = item.y.toFixed(2);
    if (!linesByY[yKey]) {
      linesByY[yKey] = [];
    }
    linesByY[yKey].push(item);
  });
  
  // Sort each line by X position and print
  Object.keys(linesByY).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(yKey => {
    const lineItems = linesByY[yKey].sort((a, b) => a.x - b.x);
    const lineText = lineItems.map(item => item.text).join(' ');
    console.log(`Y=${yKey}: ${lineText}`);
  });
});

pdfParser.loadPDF(pdfPath);
