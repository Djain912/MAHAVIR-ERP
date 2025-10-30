import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, '../../pdf/Copy of Software_Data_Exc(1).xlsx');
const workbook = XLSX.readFile(filePath);

// Get all sheet names
console.log('Available sheets:', workbook.SheetNames);

// Read each sheet
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n========== ${sheetName} ==========`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Show first 10 rows
  console.log('First 10 rows:');
  data.slice(0, 10).forEach((row, index) => {
    console.log(`Row ${index}:`, row);
  });
  
  console.log(`\nTotal rows: ${data.length}`);
});
