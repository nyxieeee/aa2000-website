/**
 * Converts docs/Daily_Accomplishment_Report.html to docs/Daily_Accomplishment_Report.pdf
 * Run: npm run pdf-report
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'docs', 'Daily_Accomplishment_Report.html');
const pdfPath = path.join(root, 'docs', 'Daily_Accomplishment_Report.pdf');

const html = fs.readFileSync(htmlPath, 'utf-8');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
  printBackground: true,
});
await browser.close();

console.log('PDF saved:', pdfPath);
