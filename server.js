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
    const match = content.match(/^---\n([\s\S]*?)\n---/);
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
        // Inject into the template (reuse your existing HTML template code)
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${frontmatter.title || paperName}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="/styles/main.css" rel="stylesheet">
            <link href="/styles/print.css" rel="stylesheet" media="print">
        </head>
        <body>
            <!-- Cover Page -->
            <div class="page cover-page">
                <div class="cover-overlay">
                    <div class="cover-quote">
                        ${frontmatter.coverQuote || ''}
                    </div>
                    <div class="cover-title-block">
                        <div class="cover-year">${frontmatter.year || ''}</div>
                        <div class="cover-title">${frontmatter.title || ''}</div>
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
                            <img src="/images/author.jpg" alt="${frontmatter.author || ''}" class="cover-author-photo">
                            <div>
                                <div class="author-name">${frontmatter.author || ''}</div>
                                <div class="author-role">${frontmatter.role || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Content Pages -->
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
                    ${htmlContent}
                </main>
                <footer class="page-footer">
                    <div class="footer-content">
                        <div class="footer-left">Confidential</div>
                        <div class="footer-right">© ${new Date().getFullYear()} DGB Consultores</div>
                    </div>
                </footer>
            </div>
        </body>
        </html>`;
        res.send(html);
    } catch (error) {
        return res.status(404).send('Paper not found');
    }
});

// PDF generation route
app.get('/paper/:paperName/pdf', async (req, res) => {
    const paperName = req.params.paperName;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        // Load the paper's HTML version
        await page.goto(`http://localhost:${port}/paper/${paperName}`, {
            waitUntil: 'networkidle0'
        });

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {top: '0cm', right: '0cm', bottom: '0cm', left: '0cm'}
        });

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