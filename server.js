const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const marked = require('marked');
const puppeteer = require('puppeteer');
const yaml = require('js-yaml');
const TemplateProcessor = require('./js/template-processor');

const app = express();
const port = process.env.PORT || 3000;
const templateProcessor = new TemplateProcessor();

// Serve static files
app.use(express.static('.'));

// Initialize template processor
templateProcessor.loadTemplates().catch(console.error);

// Helper function to read markdown files
async function readMarkdownFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

// Helper function to parse frontmatter
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
        try {
            const frontmatter = yaml.load(match[1]);
            const markdown = content.slice(match[0].length).trim();
            return { frontmatter, markdown };
        } catch (error) {
            console.error('Error parsing frontmatter:', error);
            return { frontmatter: {}, markdown: content };
        }
    }
    return { frontmatter: {}, markdown: content };
}

// Helper function to get all papers
async function getAllPapers() {
    const papersDir = path.join(__dirname, 'papers');
    try {
        const entries = await fs.readdir(papersDir, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    } catch (error) {
        console.error('Error reading papers directory:', error);
        return [];
    }
}

// Homepage: List all papers in /papers as links
app.get('/', async (req, res) => {
    try {
        const papersDir = path.join(__dirname, 'papers');
        const files = await fs.readdir(papersDir);
        const papers = files.filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
        const papersList = papers.map(paper => `
            <div class="paper-card">
                <h2>${paper}</h2>
                <a href="/${paper}" class="btn btn-primary">Read Paper</a>
            </div>
        `).join('');
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DGB White Papers</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="styles/main.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h1 class="mb-4">DGB White Papers</h1>
                    <div class="row">
                        ${papersList}
                    </div>
                </div>
            </body>
            </html>
        `;
        res.send(html);
    } catch (error) {
        res.status(500).send('Error loading papers');
    }
});

// Helper: Paginate HTML content into .page.content-page divs (placeholder, to be replaced with Puppeteer logic)
function paginateContentToPages(htmlContent) {
    // Split on [PAGEBREAK] marker (case-insensitive, allow with or without surrounding whitespace)
    const parts = htmlContent.split(/\[PAGEBREAK\]/gi);
    return parts.map(part => `
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
                    <div class="footer-left">Confidential</div>
                    <div class="footer-right">© ${new Date().getFullYear()} DGB Consultores</div>
                </div>
            </footer>
        </div>
    `);
}

// Dynamic paper route: /:paperName renders papers/paperName.md
app.get('/:paperName', async (req, res, next) => {
    const paperName = req.params.paperName;
    // Ignore requests for static files (like .css, .js, .png, etc.)
    if (paperName.includes('.')) return next();
    const markdownPath = path.join(__dirname, 'papers', `${paperName}.md`);
    try {
        const markdown = await readMarkdownFile(markdownPath);
        if (!markdown) return res.status(404).send('Paper not found');
        // Parse frontmatter and markdown content
        const { frontmatter, markdown: content } = parseFrontmatter(markdown);
        // Process templates in the content
        const processedContent = templateProcessor.processContent(content);
        // Convert markdown to HTML
        const htmlContent = marked.parse(processedContent);
        // Paginate content into .page.content-page divs
        const contentPages = paginateContentToPages(htmlContent);
        // Generate the cover page statically from frontmatter
        const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
        const coverPage = `
            <div class="page cover-page" style="position: relative;">
                <img src='${baseUrl}/images/cover.jpg' style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;" alt="Cover Background">
                <div class="cover-overlay" style="position: relative; z-index: 1;">
                    <div class="cover-quote">
                        ${frontmatter.coverQuote || ''}
                    </div>
                    <div class="cover-title-block">
                        <div class="cover-year">${frontmatter.year || ''}</div>
                        <div class="cover-title">
                            ${frontmatter.title_main || ''}<br>
                            <span class="cover-title-accent" style="background: linear-gradient(90deg, #ffcc00 0%, #ff5500 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-fill-color: transparent; font-size: 2.5rem; font-family: 'Roboto', Arial, Helvetica, sans-serif; font-weight: 900; letter-spacing: 0.02em;">
                                ${frontmatter.title_accent || ''}
                            </span>
                        </div>
                    </div>
                    <div class="cover-footer">
                        <div class="cover-contact-row">
                            <div class="cover-contact-block">
                                <div class="contact-label">CONTATO</div>
                                <div class="contact-info">${frontmatter.contact || ''}</div>
                            </div>
                            <div class="divider"></div>
                            <div class="cover-contact-block">
                                <div class="contact-label">WEBSITE</div>
                                <div class="contact-info">${frontmatter.website || ''}</div>
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
                </div>
            </div>
        `;
        // Concatenate cover and content pages
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
        </head>
        <body>
            ${coverPage}
            ${contentPages.join('\n')}
            <a href="/${paperName}/pdf" class="export-pdf-btn" download>Export as PDF</a>
        </body>
        </html>`;
        res.send(html);
    } catch (error) {
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