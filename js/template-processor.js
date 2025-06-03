const fs = require('fs').promises;
const path = require('path');

class TemplateProcessor {
    constructor() {
        this.templates = new Map();
        this.headings = [];
        this.treeBlocks = [];
        this.quemSomosBlock = null;
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
            // If no templates were loaded, create a default cascade template
            if (this.templates.size === 0) {
                this.templates.set('cascade', `
                    <div class="apqc-hierarchy-cascade">
                        <div class="apqc-level apqc-level<%= level %>">
                            <div class="apqc-col-left">
                                <div class="apqc-label">Level <%= level %></div>
                                <div class="apqc-name"><%= title1 %></div>
                            </div>
                            <div class="apqc-col-right">
                                <div class="apqc-desc"><%= title2 %></div>
                            </div>
                        </div>
                    </div>
                `);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            // Create default templates if loading fails
            this.templates.set('cascade', `
                <div class="apqc-hierarchy-cascade">
                    <div class="apqc-level apqc-level<%= level %>">
                        <div class="apqc-col-left">
                            <div class="apqc-label">Level <%= level %></div>
                            <div class="apqc-name"><%= title1 %></div>
                        </div>
                        <div class="apqc-col-right">
                            <div class="apqc-desc"><%= title2 %></div>
                        </div>
                    </div>
                </div>
            `);
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

    async processContent(content) {
        // Trim all content after [END] marker
        const endIdx = content.indexOf('[END]');
        if (endIdx !== -1) {
            content = content.slice(0, endIdx);
        }
        console.log('--- processContent called ---');
        console.log('First 500 chars of content:', content.slice(0, 500));
        console.log('QUEMSOMOS present:', content.includes('[QUEMSOMOS]'));
        // Extract headings for TOC
        this.headings = [];
        this.treeBlocks = [];
        let treeBlockIndex = 0;
        const headingRegex = /^(#{1,3})\s+(.+)$/gm;
        let match;
        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            this.headings.push({ level, text, id });
        }

        // Add IDs to headings in content
        content = content.replace(headingRegex, (match, hashes, text) => {
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `${hashes} <span id="${id}">${text}</span>`;
        });

        // Replace [TREE]...[/TREE] with placeholders and store HTML
        content = content.replace(/\[TREE\]([\s\S]*?)\[\/TREE\]/g, (match, treeContent) => {
            // Parse lines into nodes with indentation
            const lines = treeContent.trim().split('\n').filter(Boolean);
            const nodes = lines.map(line => {
                const match = line.match(/^\s*\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/);
                if (!match) return null;
                const [_, title, tag, color, description] = match;
                const indent = line.match(/^\s*/)[0].length;
                return { title, tag, color, description, indent, children: [] };
            }).filter(Boolean);

            // Build tree from flat list
            const root = { children: [] };
            const stack = [{ node: root, indent: -1 }];
            for (const node of nodes) {
                while (stack.length && node.indent <= stack[stack.length - 1].indent) {
                    stack.pop();
                }
                stack[stack.length - 1].node.children.push(node);
                stack.push({ node, indent: node.indent });
            }

            // Render tree recursively as <ul class="wtree"><li>...</li></ul>
            function renderTree(nodes, isRoot = false) {
                let html = isRoot ? '<ul class="wtree">' : '<ul>';
                nodes.forEach(node => {
                    html += '<li>';
                    html += `<div class=\"wtree-entry\">`;
                    html += `<div class=\"wtree-row\">`;
                    html += `<div class=\"wtree-title\">${node.title}</div>`;
                    if (node.tag) {
                        let tagStyle = '';
                        if (node.color) {
                            // Helper to determine if color is light or dark
                            function isColorLight(hex) {
                                // Remove # if present
                                hex = hex.replace('#', '');
                                // Convert 3-digit to 6-digit
                                if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
                                const r = parseInt(hex.substr(0,2),16);
                                const g = parseInt(hex.substr(2,2),16);
                                const b = parseInt(hex.substr(4,2),16);
                                // Perceived brightness
                                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                return brightness > 160; // tweak threshold as needed
                            }
                            const textColor = isColorLight(node.color) ? '#222' : '#fff';
                            tagStyle = ` style=\"background:${node.color};color:${textColor}\"`;
                        }
                        html += `<div class=\"wtree-tag\"${tagStyle}>${node.tag}</div>`;
                    }
                    html += `</div>`;
                    if (node.description) html += `<div class=\"wtree-desc\">${node.description}</div>`;
                    html += `</div>`;
                    if (node.children.length) {
                        html += renderTree(node.children, false);
                    }
                    html += '</li>';
                });
                html += '</ul>';
                return html;
            }

            const html = renderTree(root.children, true);
            const placeholder = `[[TREE_BLOCK_${treeBlockIndex}]]`;
            this.treeBlocks.push(html);
            treeBlockIndex++;
            return placeholder;
        });

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
        // Replace [NOGAP] with a styled nogap div
        content = content.replace(/\[NOGAP\]/g, '<div class="nogap"></div>');
        // Replace template placeholders with actual template content (legacy)
        content = content.replace(/\[TEMPLATE:([^\]]+)\]/g, (match, templateName) => {
            const template = this.templates.get(templateName);
            return template || match; // Return original if template not found
        });
        // HORIZONTAL-WATERFALL chart block
        content = content.replace(/\[HORIZONTAL-WATERFALL\]([\s\S]*?)\[\/HORIZONTAL-WATERFALL\]/g, (match, block) => {
            // Parse block lines
            const lines = block.split(/\n+/).map(l => l.trim()).filter(Boolean);
            let title = '', legend = 'NONE', barColor = null, backgrounds = [], axes = [], entries = [];
            lines.forEach(line => {
                if (line.startsWith('[TITLE]')) {
                    title = line.match(/\[TITLE\]\[(.*)\]/)?.[1] || '';
                } else if (line.startsWith('[LEGEND]')) {
                    legend = line.match(/\[LEGEND\]\[(.*)\]/)?.[1] || 'NONE';
                } else if (line.startsWith('[BARCOLOR]')) {
                    barColor = line.match(/\[BARCOLOR\]\[(.*)\]/)?.[1] || null;
                } else if (line.startsWith('[BACKGROUNDCOLOR]')) {
                    const m = line.match(/\[BACKGROUNDCOLOR\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/);
                    if (m) backgrounds.push({ color: m[3], start: parseFloat(m[1]), end: parseFloat(m[2]) });
                } else if (line.startsWith('[AXIS]')) {
                    const m = line.match(/\[AXIS\]\[(.*?)\]\[(.*?)\]/);
                    if (m) axes.push([parseFloat(m[1]), parseFloat(m[2])]);
                } else if (line.startsWith('[ENTRY]')) {
                    const m = line.match(/\[ENTRY\]\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/);
                    if (m) entries.push({ name: m[1], start: parseFloat(m[2]), avg: parseFloat(m[3]), end: parseFloat(m[4]) });
                }
            });
            // Default bar color
            if (!barColor) barColor = '#ff5500';
            // Compose chartData
            const chartData = JSON.stringify({ title, legend, barColor, backgrounds, axes, entries });
            // Unique id for chart
            const id = 'hwf_' + Math.random().toString(36).slice(2, 10);
            // Render template
            let template = this.templates.get('horizontal-waterfall');
            if (!template) return '';
            return template
                .replace(/<%= id %>/g, id)
                .replace(/<%= chartData %>/g, chartData);
        });
        // PLOTLY-BOXPLOT block for CSV-driven boxplots
        content = content.replace(/\[PLOTLY-BOXPLOT\]\[csv=([^\]]+)\]\[category_col=([^\]]+)\]\[value_col=([^\]]+)\](\[title=([^\]]*)\])?/g, (match, csv, category_col, value_col, _t, title) => {
            const id = 'plotly_boxplot_' + Math.random().toString(36).slice(2, 10);
            const plotData = JSON.stringify({ csv, category_col, value_col, title: title || '' });
            return `<div class="plotly-boxplot" id="${id}" style="width:100%; min-height:340px;"></div>\n<script type="application/json" class="plotly-boxplot-data">${plotData}</script>`;
        });
        // RANGE-STACKED-BAR block for min/center/max horizontal bar
        content = content.replace(/\[RANGE-STACKED-BAR\]([\s\S]*?)\[\/RANGE-STACKED-BAR\]/g, (match, block) => {
            const lines = block.split(/\n+/).map(l => l.trim()).filter(Boolean);
            let title = '', axes = [], entries = [], height = null;
            lines.forEach(line => {
                if (line.startsWith('[TITLE]')) {
                    title = line.match(/\[TITLE\]\[(.*)\]/)?.[1] || '';
                } else if (line.startsWith('[AXIS]')) {
                    const m = line.match(/\[AXIS\]\[(.*?)\]\[(.*?)\]/);
                    if (m) axes = [parseFloat(m[1]), parseFloat(m[2])];
                } else if (line.startsWith('[HEIGHT]')) {
                    const m = line.match(/\[HEIGHT\]\[(.*?)\]/);
                    if (m) height = parseInt(m[1]);
                } else if (line.startsWith('[ENTRY]')) {
                    const m = line.match(/\[ENTRY\]\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/);
                    if (m) entries.push({ name: m[1], min: parseFloat(m[2]), center: parseFloat(m[3]), max: parseFloat(m[4]) });
                }
            });
            const chartData = JSON.stringify({ title, axes, entries, height });
            const id = 'range_stacked_bar_' + Math.random().toString(36).slice(2, 10);
            return `<div class="range-stacked-bar-chart" id="${id}" style="width:100%; min-height:340px;"></div>\n<script type="application/json" class="range-stacked-bar-data">${chartData}</script>`;
        });
        // PLOTLY-SCATTER block for CSV-driven scatter plots
        content = content.replace(/\[PLOTLY-SCATTER\]\[csv=([^\]]+)\](\[category_col=([^\]]+)\])?\[name_col=([^\]]+)\]\[x_col=([^\]]+)\]\[y_col=([^\]]+)\](\[textposition:([^\]]+)\])?(\[xaxis_label=([^\]]*)\])?(\[yaxis_label=([^\]]*)\])?(\[title=([^\]]*)\])?/g, (match, csv, _catBlock, category_col, name_col, x_col, y_col, _tpBlock, textposition, _xLabBlock, xaxis_label, _yLabBlock, yaxis_label, _t, title) => {
            const id = 'plotly_scatter_' + Math.random().toString(36).slice(2, 10);
            const plotData = JSON.stringify({ csv, category_col: category_col || '', name_col, x_col, y_col, textposition: textposition || '', xaxis_label: xaxis_label || '', yaxis_label: yaxis_label || '', title: title || '' });
            return `<div class=\"plotly-scatter\" id=\"${id}\" style=\"width:100%; min-height:340px;\"></div>\n<script type=\"application/json\" class=\"plotly-scatter-data\">${plotData}</script>`;
        });
        // PLOTLY-RADAR block for CSV-driven radar charts
        content = content.replace(/\[PLOTLY-RADAR\]\[csv=([^\]]+)\]\[category_col=([^\]]+)\]\[value_col=([^\]]+)\]\[name_col=([^\]]+)\](\[title=([^\]]*)\])?(\[range_min=([^\]]*)\])?(\[range_max=([^\]]*)\])?(\[left_margin=([^\]]*)\])?(\[hide_legend=([^\]]*)\])?(\[font_size=([^\]]*)\])?/g,
            (match, csv, category_col, value_col, name_col, _t, title, _rmin, range_min, _rmax, range_max, _lm, left_margin, _hl, hide_legend, _fs, font_size) => {
                const id = 'plotly_radar_' + Math.random().toString(36).slice(2, 10);
                const plotData = JSON.stringify({ csv, category_col, value_col, name_col, title: title || '', range_min: range_min || '', range_max: range_max || '', hide_legend: hide_legend === 'true', font_size: font_size || '' });
                const marginStyle = left_margin && left_margin !== '' ? `margin-left:${left_margin};` : '';
                return `<div class=\"plotly-radar\" id=\"${id}\" style=\"width:100%; min-height:340px;${marginStyle}\"></div><script type=\"application/json\" class=\"plotly-radar-data\">${plotData}</script>`;
            });
        // Replace [MERMAID]...[/MERMAID] blocks, no manual sizing, let Mermaid expand naturally
        content = content.replace(
            /\[MERMAID[^\]]*\]([\s\S]*?)\[\/MERMAID\]/g,
            (match, code) => {
                return `<div class="mermaid-wrapper"><pre class="mermaid">${code.trim()}</pre></div>`;
            }
        );
        // Replace [LEGEND]...[/LEGEND] blocks with a horizontal legend bar
        content = content.replace(
            /\[LEGEND\]([\s\S]*?)\[\/LEGEND\]/g,
            (match, legendBlock) => {
                // Split on commas, trim, and parse [color][text] pairs
                const items = legendBlock.split(',').map(s => s.trim()).filter(Boolean);
                const html = items.map(item => {
                    const m = item.match(/\[(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]\[(.*?)\]/);
                    if (!m) return '';
                    const color = m[1];
                    const text = m[2];
                    return `<span class=\"legend-item\"><span class=\"legend-color\" style=\"background:${color}\"></span>${text}</span>`;
                }).join(' ');
                return `<div class=\"legend-bar\">${html}</div>`;
            }
        );
        // FONT_SIZE block for inline font size changes
        content = content.replace(/\[FONT_SIZE\]\[([^\]]+)\]([\s\S]*?)\[\/FONT_SIZE\]/g, (match, size, inner) => {
            return `<span style="font-size:${size}">${inner.trim()}</span>`;
        });
        // QUEMSOMOS block for dynamic team section (async-safe)
        this.quemSomosBlock = null;
        if (content.includes('[QUEMSOMOS]')) {
            const matches = [...content.matchAll(/\[QUEMSOMOS\]/g)];
            for (const match of matches) {
                let partners = [];
                try {
                    const csvPath = path.join(__dirname, '../data/partners.csv');
                    const csv = await fs.readFile(csvPath, 'utf8');
                    const lines = csv.split(/\r?\n/).filter(Boolean);
                    const header = lines[0].split(',');
                    const nameIdx = header.indexOf('Name');
                    const descIdx = header.indexOf('Description1');
                    const cvIdx = header.indexOf('CV');
                    const picIdx = header.indexOf('Picture Path');
                    for (let i = 1; i < lines.length; ++i) {
                        const cols = lines[i].match(/("[^"]*"|[^,]+)/g).map(s => s.replace(/^"|"$/g, ''));
                        console.log('Parsed cols:', cols);
                        console.log('Name index:', nameIdx, 'Name value:', cols[nameIdx]);
                        partners.push({
                            name: cols[nameIdx] || '',
                            desc: cols[descIdx] || '',
                            cv: (cols[cvIdx] || '').replace(/\\n/g, '<br>'),
                            pic: cols[picIdx] || '/images/placeholder.jpg'
                        });
                    }
                } catch (e) {
                    partners = [];
                }
                // Main text and image
                const mainText = `
                  <div class=\"quemsomos-main\">\n                    <div class=\"quemsomos-row\">\n                      <div class=\"quemsomos-text\">\n                        <div class=\"qs-intro\">Somos uma boutique especializada em Estratégia, Estruturação e Reestruturação, Eficiência e Sociedades de Serviço.<br><br>Temos mais de 10 anos de história, com mais de 100 projetos em 50 clientes de indústrias e setores distintos.<br><br><b>Nosso Propósito</b></div>\n                        <div class=\"qs-content\">\n                          <div class=\"qs-row\"><div class=\"qs-bar qs-bar-orange\"></div><p>Vivemos com o propósito de ajudar empreendedores e executivos a alcançar realizações extraordinárias em suas empresas, liderando e inspirando pessoas a entregar mais do que imaginam conseguir.</p></div>\n                          <div class=\"qs-row\"><div class=\"qs-bar qs-bar-yellow\"></div><p>Fazemos isso desmistificando a Gestão empresarial, tornando-a simples, objetiva e extremamente eficaz. Dessa forma, ao invés de ser um entrave, a Gestão passa a ser a grande ferramenta viabilizadora do sucesso.</p></div>\n                          <div class=\"qs-row\"><div class=\"qs-bar qs-bar-blue\"></div><p>Somos uma boutique focada em Gestão Empresarial, especialista em Implantação de Modelos de Gestão, o que permite relacionar as principais competências organizacionais em um processo simples, porém robusto, de gestão. É a melhor forma de transformar o Planejamento Estratégico em execução, relacionando Propósito, Estratégia, Metas, Desempenho e Cultura, na principal ferramenta de Gestão Empresarial. É o painel de controle do CEO. Reestruturação e Estruturação é o nosso DNA, recuperar a empresa ou prepará-la para o crescimento é nosso grande propósito.</p></div>\n                        </div>\n                      </div>\n                    </div>\n                `;
                // Partners section
                let partnersHtml = '';
                if (partners.length) {
                  partnersHtml = '<div class="qs-socios-title"><b>Sócios</b></div>';
                  partnersHtml += '<div class="quemsomos-partners">';
                  for (const p of partners) {
                    partnersHtml += `
                      <div class="qs-partner">
                        <img src="${p.pic}" alt="${p.name}" class="qs-partner-img" />
                        <div>
                          <div class="qs-partner-name">${p.name}</div>
                          <div class="qs-partner-desc">${p.desc}</div>
                          <div class="qs-partner-cv">${p.cv}</div>
                        </div>
                      </div>
                    `;
                  }
                  partnersHtml += '</div>';
                } else {
                  partnersHtml = '<div class="quemsomos-partners"><em>Parceiros não encontrados.</em></div>';
                }
                const html = mainText + partnersHtml + '</div>';
                this.quemSomosBlock = html;
                console.log('quemSomosBlock set:', !!this.quemSomosBlock, this.quemSomosBlock && this.quemSomosBlock.slice(0, 100));
                content = content.replace('[QUEMSOMOS]', '[[QUEMSOMOS_BLOCK]]');
            }
        }
        // [IMAGE][path][width=xxx][height=yyy] block (centered, allow 100%)
        content = content.replace(/\[IMAGE\]\[([^\]]+)\](\[width=([^\]]+)\])?(\[height=([^\]]+)\])?/g, (match, path, _wBlock, width, _hBlock, height) => {
            let attrs = '';
            if (width) attrs += ` width=\"${width.replace(/[^\d%]/g, '')}\"`;
            if (height) attrs += ` height=\"${height.replace(/[^\d%]/g, '')}\"`;
            return `<div style=\"text-align:center;\"><img src=\"${path}\"${attrs} alt=\"\" style=\"display:inline-block;\" /></div>`;
        });
        // At the end, return both processed content and treeBlocks
        return { content, treeBlocks: this.treeBlocks, quemSomosBlock: this.quemSomosBlock };
    }

    generateTOC() {
        if (this.headings.length === 0) return '';

        let tocHtml = `
            <div class="page toc-page">
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
                    <h1 class="toc-title">Table of Contents</h1>
                    <ul class="toc-list">
        `;

        this.headings.forEach(heading => {
            const className = `toc-h${heading.level}`;
            tocHtml += `
                <li class="${className}">
                    <a href="#${heading.id}">
                        <span>${heading.text}</span>
                        <span class="toc-dots"></span>
                        <span class="toc-page-number"></span>
                    </a>
                </li>
            `;
        });

        tocHtml += `
                    </ul>
                </main>
                <footer class="page-footer">
                    <div class="footer-content">
                        <div class="footer-left">DGB | Consultores</div>
                        <div class="footer-right"><span class="page-number"></span></div>
                    </div>
                </footer>
            </div>
        `;

        return tocHtml;
    }
}

module.exports = TemplateProcessor; 