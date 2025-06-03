const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const marked = require('marked');
const puppeteer = require('puppeteer');
const yaml = require('js-yaml');
const TemplateProcessor = require('./js/template-processor');
const matter = require('gray-matter');
const fsSync = require('fs'); // for sync read of template

const app = express();
const port = process.env.PORT || 3000;

// Configure marked to allow raw HTML
marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
  // For marked >= 4.x, sanitize is removed, so just don't use it
  // sanitize: false, // For older versions
  // renderer: new marked.Renderer(), // Not needed unless customizing
});

// Serve static files
app.use(express.static('.'));

// Helper: Paginate HTML content into .page.content-page divs
function paginateContentToPages(markdownContent) {
    // Split on [PAGEBREAK] marker (case-insensitive, allow with or without surrounding whitespace)
    const parts = markdownContent.split(/\[PAGEBREAK\]/gi);
    return parts.map((part, idx) => `
        <div class="page content-page">
            <header class="page-header">
                <div class="header-content">
                    <div class="header-left d-flex align-items-center">
                        <span class="dot dot-navy"></span>
                        <span class="dot dot-yellow"></span>
                        <span class="dot dot-orange"></span>
                    </div>
                    <div class="header-right">
                        <img src="/images/logo.jpg" alt="DGB Logo" class="header-logo">
                    </div>
                </div>
            </header>
            <main class="page-content">
                ${part}
            </main>
            <footer class="page-footer">
                <div class="footer-content">
                    <div class="footer-left">DGB | Consultores</div>
                    <div class="footer-right"><span class="page-number"></span></div>
                </div>
            </footer>
        </div>
    `);
}

// Dynamic paper route: /:paperName renders papers/paperName/index.md
app.get('/:paperName', async (req, res, next) => {
    const paperName = req.params.paperName;
    
    // Ignore requests for static files
    if (paperName.includes('.')) return next();
    
    try {
        // Initialize template processor
        const templateProcessor = new TemplateProcessor();
        await templateProcessor.loadTemplates();

        // Read and parse markdown file
        const markdownPath = path.join(__dirname, 'papers', paperName, 'index.md');
        const markdown = await fs.readFile(markdownPath, 'utf8');
        const { content, data: frontmatter } = matter(markdown);
        
        // Process markdown content
        const processed = await templateProcessor.processContent(content);
        let htmlContent = marked.parse(processed.content);
        // Replace tree placeholders with actual HTML
        if (processed.treeBlocks && processed.treeBlocks.length) {
            processed.treeBlocks.forEach((treeHtml, idx) => {
                htmlContent = htmlContent.replace(`[[TREE_BLOCK_${idx}]]`, treeHtml);
            });
        }
        // Replace QUEMSOMOS placeholder with actual HTML, removing <p> wrapper if present
        console.log('--- BEFORE REPLACEMENT ---');
        console.log(htmlContent.slice(0, 1000)); // print first 1000 chars for brevity
        console.log('quemSomosBlock:', !!processed.quemSomosBlock);
        if (processed.quemSomosBlock) {
            htmlContent = htmlContent.replace(
                /<p>\s*\[\[QUEMSOMOS_BLOCK\]\]\s*<\/p>/g,
                processed.quemSomosBlock
            );
            htmlContent = htmlContent.split('[[QUEMSOMOS_BLOCK]]').join(processed.quemSomosBlock);
        }
        console.log('--- AFTER REPLACEMENT ---');
        console.log(htmlContent.slice(0, 1000));
        const contentPages = paginateContentToPages(htmlContent);
        
        // Generate cover overlay HTML (existing content, no header)
        const overlayHtml = `
            <div class="cover-quote">${frontmatter.quote || ''}</div>
            <div class="cover-title-block">
                <div class="cover-year">${frontmatter.year || new Date().getFullYear()}</div>
                <h1 class="cover-title">${frontmatter.title_main || paperName}</h1>
                <h1 class="cover-title-accent">${frontmatter.title_accent || ''}</h1>
            </div>
            <div class="cover-footer">
                <div class="cover-contact-row">
                    <div class="cover-contact-block">
                        <div class="contact-label">Contact</div>
                        <div class="contact-info">${frontmatter.contact || 'contact@dgb.com'}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="cover-contact-block">
                        <div class="contact-label">Website</div>
                        <div class="contact-info">${frontmatter.website || 'www.dgb.com'}</div>
                    </div>
                </div>
                <div class="cover-author-row">
                    <img src="${frontmatter.author_photo || '/images/author.jpg'}" alt="${frontmatter.author || ''}" class="cover-author-photo">
                    <div>
                        <div class="author-name">${frontmatter.author || ''}</div>
                        <div class="author-role">${frontmatter.role || ''}</div>
                    </div>
                </div>
            </div>
        `;

        // Load and render the new cover template
        const coverTemplatePath = path.join(__dirname, 'templates', 'cover-html-shapes.html');
        let coverTemplate = fsSync.readFileSync(coverTemplatePath, 'utf8');
        const coverPage = coverTemplate.replace('<%= overlay %>', overlayHtml);

        // Generate TOC only if frontmatter.toc is true
        const tocPage = frontmatter.toc === true ? templateProcessor.generateTOC() : '';

        // Concatenate cover, TOC, and content pages
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${frontmatter.title_main || paperName} ${frontmatter.title_accent || ''}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="/styles/main.css" rel="stylesheet">
            <link href="/styles/print.css" rel="stylesheet" media="print">
            <link href="/styles/print-style-override.css" rel="stylesheet" media="print">
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
            <script src="/js/main.js"></script>
        </head>
        <body>
            ${coverPage}
            ${tocPage}
            ${contentPages.join('\n')}
            <a href="/${paperName}/pdf" class="export-pdf-btn" download>Export as PDF</a>
            <script src="/js/export-toast.js"></script>
        </body>
        </html>`;
        res.send(html);
    } catch (error) {
        console.error('Error rendering paper:', error);
        return res.status(404).send('Paper not found');
    }
});

// PDF generation route
app.get('/:paperName/pdf', async (req, res) => {
    const paperName = req.params.paperName;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
    
    try {
        await page.goto(`http://localhost:${port}/${paperName}`, {
            waitUntil: 'networkidle0'
        });
        // Wait for all images (including background images) to load
        await page.evaluate(async () => {
            // Wait for <img> tags
            const imgPromises = Array.from(document.images).map(img => img.complete ? null : new Promise(resolve => { img.onload = img.onerror = resolve; }));
            // Wait for background images
            const bgPromises = Array.from(document.querySelectorAll('*')).map(el => {
                const bg = window.getComputedStyle(el).backgroundImage;
                if (bg && bg !== 'none' && bg.includes('url(')) {
                    // Create a dummy image to check loading
                    const url = bg.match(/url\(["']?(.*?)["']?\)/)[1];
                    return new Promise(resolve => {
                        const img = new window.Image();
                        img.onload = img.onerror = resolve;
                        img.src = url;
                    });
                }
                return null;
            });
            await Promise.all([...imgPromises, ...bgPromises].filter(Boolean));
        });
        // Remove main.css and add print-pdf.css
        await page.evaluate(() => {
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                if (link.href.includes('main.css')) link.remove();
            });
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/print-pdf.css';
            document.head.appendChild(link);
        });
        // Wait for fonts to load
        await page.evaluateHandle('document.fonts.ready');
        // Set viewport to match your design (A4 at 96dpi is about 794x1123, but you may want higher for retina)
        await page.setViewport({ width: 1240, height: 1754 });

        // Patch CSS to use absolute URL for cover image
        await page.evaluate((baseUrl) => {
            // Patch <style> tags
            document.querySelectorAll('style').forEach(styleEl => {
                if (styleEl.innerHTML && styleEl.innerHTML.includes("/images/cover.jpg")) {
                    styleEl.innerHTML = styleEl.innerHTML.replace(
                        /url\(['"]?\/images\/cover\.jpg['"]?\)/g,
                        `url('${baseUrl}/images/cover.jpg')`
                    );
                }
            });
            // Patch inline style attributes
            document.querySelectorAll('[style]').forEach(el => {
                if (el.style.backgroundImage && el.style.backgroundImage.includes('/images/cover.jpg')) {
                    el.style.backgroundImage = `url('${baseUrl}/images/cover.jpg')`;
                }
            });
        }, baseUrl);

        const pdf = await page.pdf({
            width: '210mm',
            height: '297mm',
            printBackground: true,
            margin: { top: '0cm', right: '0cm', bottom: '0cm', left: '0cm' }
        });

        res.setHeader('Content-Disposition', `attachment; filename="${paperName}.pdf"`);
        res.contentType('application/pdf');
        res.send(pdf);
    } catch (error) {
        res.status(500).send('Error generating PDF');
    } finally {
        await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 