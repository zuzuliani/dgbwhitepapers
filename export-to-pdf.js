const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Use absolute file path for local HTML
  const filePath = path.resolve(__dirname, 'index.html');
  await page.goto('file://' + filePath, {waitUntil: 'networkidle0'});
  await page.pdf({
    path: 'report.pdf',
    format: 'A4',
    printBackground: true,
    margin: {top: '0cm', right: '0cm', bottom: '0cm', left: '0cm'}
  });
  await browser.close();
})(); 