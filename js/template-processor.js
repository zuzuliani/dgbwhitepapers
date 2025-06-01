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

    processContent(content) {
        // Replace template placeholders with actual template content
        return content.replace(/\[TEMPLATE:([^\]]+)\]/g, (match, templateName) => {
            const template = this.templates.get(templateName);
            return template || match; // Return original if template not found
        });
    }
}

module.exports = TemplateProcessor; 