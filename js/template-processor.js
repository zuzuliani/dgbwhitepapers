const fs = require('fs').promises;
const path = require('path');

class TemplateProcessor {
    constructor() {
        this.templates = new Map();
    }

    async loadTemplates() {
        const templatesDir = path.join(__dirname, '..', 'templates');
        try {
            const files = await fs.readdir(templatesDir);
            for (const file of files) {
                if (file.endsWith('.html')) {
                    const templateName = path.basename(file, '.html');
                    const content = await fs.readFile(path.join(templatesDir, file), 'utf8');
                    this.templates.set(templateName, content);
                }
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    renderCascade(level, title1, title2, description) {
        // Use the new function-style template
        // We'll use a simple string replace for this example
        const template = this.templates.get('cascade');
        if (!template) return '';
        // Replace EJS-style placeholders
        return template
            .replace(/<%= level %>/g, level)
            .replace(/<%= title1 %>/g, title1)
            .replace(/<%= title2 %>/g, title2)
            .replace(/<%= description %>/g, description);
    }

    processContent(content) {
        // Custom TABLE block processing
        content = content.replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/g, (match, tableBlock) => {
            // Split on [PAGEBREAK] to support multi-page tables
            const parts = tableBlock.split(/\[PAGEBREAK\]/g);
            let htmlTables = parts.map((part, idx) => {
                let rows = part.trim().split(/\n+/).filter(Boolean);
                let headers = [];
                let bodyRows = [];
                rows.forEach(row => {
                    if (row.startsWith('[HEADERS]')) {
                        headers = row.match(/\[(.*?)\]/g).slice(1).map(h => h.replace(/\[|\]/g, ''));
                    } else if (row.startsWith('[ROW]')) {
                        bodyRows.push(row.match(/\[(.*?)\]/g).slice(1).map(c => c.replace(/\[|\]/g, '')));
                    }
                });
                let html = '<table><thead>';
                if (headers.length) {
                    html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
                }
                html += '</thead><tbody>';
                bodyRows.forEach(row => {
                    html += '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>';
                });
                html += '</tbody></table>';
                return html;
            });
            return htmlTables.join('[PAGEBREAK]');
        });
        // Replace [CASCADE][level][title1][title2][description] with the rendered template
        content = content.replace(/\[CASCADE\]\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/g, (match, level, title1, title2, description) => {
            return this.renderCascade(level, title1, title2, description);
        });
        // Replace [TABLECONTINUE] with table close, page break, and table open (legacy, can be removed)
        content = content.replace(/\[TABLECONTINUE\]/g, '</tbody></table>[PAGEBREAK]<table><tbody>');
        // Replace [GAP] with a styled gap
        content = content.replace(/\[GAP\]/g, '<div class="gap"></div>');
        // Replace template placeholders with actual template content (legacy)
        return content.replace(/\[TEMPLATE:([^\]]+)\]/g, (match, templateName) => {
            const template = this.templates.get(templateName);
            return template || match; // Return original if template not found
        });
    }
}

module.exports = TemplateProcessor; 