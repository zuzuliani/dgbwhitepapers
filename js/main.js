// Configuration object for easy customization
const config = {
    reportTitle: 'Corporate White Paper',
    reportSubtitle: 'Analysis Report',
    reportDate: new Date().toLocaleDateString(),
    reportAuthor: 'Your Name',
    companyName: 'Company Name',
    pageBackground: 'images/page-bg.jpg',
    coverBackground: 'images/cover-bg.jpg'
};

// Initialize the report
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page numbers
    updatePageNumbers();

    // Initialize TOC
    initializeTOC();

    // Initialize charts
    initializeCharts();

    // Initialize tables
    initializeTables();

    // PLOTLY CSV-DRIVEN BOXPLOT RENDERING
    renderPlotlyBoxplots();

    // RANGE-STACKED-BAR RENDERING
    renderRangeStackedBarCharts();

    // PLOTLY CSV-DRIVEN SCATTER PLOT RENDERING
    renderPlotlyScatters();

    // MERMAID CHART RENDERING
    renderMermaidCharts();

    // PLOTLY CSV-DRIVEN RADAR CHART RENDERING
    renderPlotlyRadars();
});

// Update page numbers
function updatePageNumbers() {
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach((element, index) => {
        element.textContent = index + 1;
    });

    // Update TOC page numbers
    const tocLinks = document.querySelectorAll('.toc-list a');
    tocLinks.forEach(link => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const pageElement = targetElement.closest('.page');
            const pageNumber = Array.from(document.querySelectorAll('.page')).indexOf(pageElement) + 1;
            link.querySelector('.toc-page-number').textContent = pageNumber;
        }
    });
}

// Initialize smooth scrolling for TOC links
function initializeTOC() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Initialize charts
function initializeCharts() {
    const chartEl = document.getElementById('analysisChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');
    
    // Example chart configuration
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
            datasets: [{
                label: 'Analysis Results',
                data: [65, 59, 80, 81],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(241, 196, 15, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Analysis Overview'
                }
            }
        }
    });
}

// Initialize tables with sample data
function initializeTables() {
    const tableBody = document.querySelector('.table tbody');
    if (!tableBody) return;
    const sampleData = [
        {
            category: 'Market Analysis',
            finding: 'Growing market demand',
            impact: 'High'
        },
        {
            category: 'Competition',
            finding: 'New entrants in market',
            impact: 'Medium'
        },
        {
            category: 'Technology',
            finding: 'Emerging trends identified',
            impact: 'High'
        }
    ];

    sampleData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.category}</td>
            <td>${row.finding}</td>
            <td>${row.impact}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Function to add new content sections
function addContentSection(title, content) {
    const mainContent = document.querySelector('.page-content');
    const section = document.createElement('section');
    section.className = 'content-section';
    section.innerHTML = `
        <h2>${title}</h2>
        <div class="section-content">${content}</div>
    `;
    mainContent.appendChild(section);
    updatePageNumbers();
}

// Function to update report configuration
function updateConfig(newConfig) {
    Object.assign(config, newConfig);
    // Update the UI with new configuration
    document.querySelector('.cover-title').textContent = config.reportTitle;
    document.querySelector('.cover-subtitle').textContent = config.reportSubtitle;
    document.getElementById('report-date').textContent = config.reportDate;
    document.getElementById('report-author').textContent = config.reportAuthor;
}

// PLOTLY CSV-DRIVEN BOXPLOT RENDERING
function renderPlotlyBoxplots() {
  document.querySelectorAll('.plotly-boxplot').forEach(async (plotEl) => {
    const dataScript = plotEl.nextElementSibling;
    if (!dataScript || !dataScript.classList.contains('plotly-boxplot-data')) return;
    const plotData = JSON.parse(dataScript.textContent);
    // Fetch CSV
    const resp = await fetch(`/data/${plotData.csv}`);
    const csvText = await resp.text();
    // Parse CSV
    const rows = csvText.split(/\r?\n/).filter(Boolean);
    const header = rows[0].split(',');
    const catIdx = header.indexOf(plotData.category_col);
    const valIdx = header.indexOf(plotData.value_col);
    if (catIdx === -1 || valIdx === -1) return;
    // Group values by category
    const dataByCat = {};
    for (let i = 1; i < rows.length; ++i) {
      const cols = rows[i].split(',');
      const cat = cols[catIdx];
      const val = parseFloat(cols[valIdx]);
      if (!cat || isNaN(val)) continue;
      if (!dataByCat[cat]) dataByCat[cat] = [];
      dataByCat[cat].push(val);
    }
    // Prepare traces for true horizontal boxplots
    const traces = Object.entries(dataByCat).map(([cat, values]) => ({
      x: values,
      y: Array(values.length).fill(cat),
      name: cat,
      type: 'box',
      orientation: 'h',
      boxpoints: false,
      marker: { color: '#ff8f27' },
      line: { width: 1, color: '#ff5500' },
      fillcolor: '#ffd200',
      boxmean: false
    }));
    // Layout
    const layout = {
      title: { text: plotData.title || '', font: { size: 20, family: 'Lato, Arial, sans-serif', color: '#222' }, xref: 'paper', x: 0 },
      margin: { l: 140, r: 40, t: 60, b: 40 },
      yaxis: {
        automargin: true,
        tickfont: { size: 10, family: 'Lato, Arial, sans-serif', color: '#222' },
      },
      xaxis: { tickfont: { size: 14, family: 'Lato, Arial, sans-serif', color: '#222' } },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      showlegend: false,
      boxmode: 'group',
    };
    plotEl.innerHTML = '';
    Plotly.newPlot(plotEl, traces, layout, {displayModeBar: false, responsive: true});
  });
}

// RANGE-STACKED-BAR RENDERING
function renderRangeStackedBarCharts() {
  // Helper to clip label to a single line with ellipsis
  function clipLabel(label, maxLen = 48) {
    return label.length > maxLen ? label.slice(0, maxLen - 3) + '...' : label;
  }
  document.querySelectorAll('.range-stacked-bar-chart').forEach((chartEl) => {
    const dataScript = chartEl.nextElementSibling;
    if (!dataScript || !dataScript.classList.contains('range-stacked-bar-data')) return;
    const data = JSON.parse(dataScript.textContent);
    const categories = data.entries.map(e => e.name);
    const minVals = data.entries.map(e => e.min);
    const rangeVals = data.entries.map(e => e.max - e.min);
    const centerVals = data.entries.map(e => e.center);
    const wrappedLabels = categories.map(l => clipLabel(l, 48));
    const reversedCategories = [...categories].reverse();
    const reversedLabels = [...wrappedLabels].reverse();
    // Offset (invisible)
    const offsetTrace = {
      y: categories,
      x: minVals,
      name: 'Offset',
      type: 'bar',
      orientation: 'h',
      marker: { color: 'rgba(0,0,0,0)' },
      hoverinfo: 'skip',
      showlegend: false,
    };
    // Range (visible)
    const rangeTrace = {
      y: categories,
      x: rangeVals,
      name: 'Range',
      type: 'bar',
      orientation: 'h',
      marker: { color: 'rgba(255,85,0,0.5)' },
      text: '',
      hovertemplate: 'Min: %{base}<br>Max: %{x+base}<extra></extra>',
      base: minVals,
      showlegend: false,
    };
    // Center marker (scatter)
    const centerTrace = {
      y: categories,
      x: centerVals,
      mode: 'markers+text',
      type: 'scatter',
      marker: { color: '#162F56', size: 14, line: { color: '#fff', width: 2 } },
      text: centerVals.map(String),
      textposition: 'middle right',
      textfont: { color: '#162F56', size: 14, family: 'Lato, Arial, sans-serif', weight: 700 },
      hoverinfo: 'skip',
      showlegend: false,
    };
    const chartHeight = data.height ? data.height : Math.max(340, 50 * categories.length);
    chartEl.style.height = chartHeight + 'px';
    const layout = {
      title: {
        text: '',
        pad: { t: 0, b: 0, l: 0, r: 0 },
      },
      barmode: 'stack',
      margin: { l: 0, r: 0, t: 0, b: 0 }, // reduce top margin for less gap
      height: chartHeight,
      yaxis: {
        automargin: true,
        tickfont: { size: 12, family: 'Lato, Arial, sans-serif', color: '#222', weight: 700 },
        tickmode: 'array',
        tickvals: reversedCategories,
        ticktext: reversedLabels,
        categoryorder: 'array',
        categoryarray: reversedCategories,
        showline: true,
        linecolor: '#bbb',
        linewidth: 1,
        gridcolor: '#e5e5e5',
        gridwidth: 0,
        zeroline: false,
      },
      xaxis: {
        range: data.axes && data.axes.length === 2 ? data.axes : undefined,
        tickfont: { size: 14, family: 'Lato, Arial, sans-serif', color: '#222', weight: 700 },
        showline: true,
        linecolor: '#bbb',
        linewidth: 1,
        gridcolor: '#ffffff',
        gridwidth: 0,
        zeroline: false,
        visible: false,
      },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      showlegend: false,
      bargap: 0.5,
      bargroupgap: 0.08,
    };

    chartEl.innerHTML = '';
    Plotly.newPlot(chartEl, [offsetTrace, rangeTrace, centerTrace], layout, {displayModeBar: false, responsive: true});
  });
}

// PLOTLY CSV-DRIVEN SCATTER PLOT RENDERING
function renderPlotlyScatters() {
  document.querySelectorAll('.plotly-scatter').forEach(async (plotEl) => {
    const dataScript = plotEl.nextElementSibling;
    if (!dataScript || !dataScript.classList.contains('plotly-scatter-data')) return;
    const plotData = JSON.parse(dataScript.textContent);
    // Fetch CSV
    const resp = await fetch(`/data/${plotData.csv}`);
    const csvText = await resp.text();
    // Parse CSV
    const rows = csvText.split(/\r?\n/).filter(Boolean);
    const header = rows[0].split(',');
    // Only use name_col, x_col, y_col
    const nameIdx = header.indexOf(plotData.name_col);
    const xIdx = header.indexOf(plotData.x_col);
    const yIdx = header.indexOf(plotData.y_col);
    if (nameIdx === -1 || xIdx === -1 || yIdx === -1) return;
    // Gather points
    const xVals = [], yVals = [], names = [], textPositions = [];
    const customTextPosIdx = header.indexOf('custom_text_position');
    for (let i = 1; i < rows.length; ++i) {
      const cols = rows[i].split(',');
      const name = cols[nameIdx];
      const x = parseFloat(cols[xIdx]);
      const y = parseFloat(cols[yIdx]);
      if (!name || isNaN(x) || isNaN(y)) continue;
      xVals.push(x);
      yVals.push(y);
      names.push(name);
      if (customTextPosIdx !== -1 && cols[customTextPosIdx] && cols[customTextPosIdx].trim() !== '') {
        textPositions.push(cols[customTextPosIdx].trim());
      } else {
        textPositions.push(plotData.textposition || 'middle right');
      }
    }
    // Single trace, all points same color, name to right of dot
    const trace = {
      x: xVals,
      y: yVals,
      text: names,
      mode: 'markers+text',
      type: 'scatter',
      marker: {
        color: '#ff5500',
        size: 14,
        line: { color: '#fff', width: 2 },
        symbol: 'circle',
        opacity: 0.85,
      },
      textposition: textPositions,
      textfont: { color: '#ff5500', size: 10, family: 'Lato, Arial, sans-serif', weight: 700 },
      cliponaxis: false,
      hovertemplate: '%{text}<br>X: %{x}<br>Y: %{y}<extra></extra>',
      showlegend: false,
    };
    // Layout
    const layout = {
      title: {
        text: plotData.title || '',
        font: { size: 16, family: 'Lato, Arial, sans-serif', color: '#162F56', weight: 700 },
        xref: 'paper',
        x: 0.5,
        xanchor: 'center',
        pad: { t: 0, b: 4 },
      },
      margin: { l: 60, r: 40, t: 36, b: 40 },
      height: 420,
      xaxis: {
        showline: true,
        linecolor: '#bbb',
        linewidth: 1,
        gridcolor: '#e5e5e5',
        gridwidth: 1,
        zeroline: false,
        tickfont: { size: 12, family: 'Lato, Arial, sans-serif', color: '#222' },
        title: { text: plotData.xaxis_label || '', font: { size: 14, family: 'Lato, Arial, sans-serif', color: '#222', weight: 700 } },
      },
      yaxis: {
        showline: true,
        linecolor: '#bbb',
        linewidth: 1,
        gridcolor: '#e5e5e5',
        gridwidth: 1,
        zeroline: false,
        tickfont: { size: 12, family: 'Lato, Arial, sans-serif', color: '#222' },
        title: { text: plotData.yaxis_label || '', font: { size: 14, family: 'Lato, Arial, sans-serif', color: '#222', weight: 700 } },
      },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      showlegend: false,
    };
    plotEl.innerHTML = '';
    Plotly.newPlot(plotEl, [trace], layout, {displayModeBar: false, responsive: true});
  });
}

// Mermaid chart rendering
function renderMermaidCharts() {
    if (window.mermaid) {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
                fontSize: '12px'
            }
        });
    }
    const mermaidElements = document.querySelectorAll('pre.mermaid');
    if (mermaidElements.length > 0) {
        mermaid.init(undefined, mermaidElements);
    }
}

// PLOTLY CSV-DRIVEN RADAR CHART RENDERING
function renderPlotlyRadars() {
  document.querySelectorAll('.plotly-radar').forEach(async (plotEl) => {
    const dataScript = plotEl.nextElementSibling;
    if (!dataScript || !dataScript.classList.contains('plotly-radar-data')) return;
    const plotData = JSON.parse(dataScript.textContent);
    // Fetch CSV
    const resp = await fetch(`/data/${plotData.csv}`);
    const csvText = await resp.text();
    // Parse CSV
    const rows = csvText.split(/\r?\n/).filter(Boolean);
    const header = rows[0].split(',');
    const axisIdx = header.indexOf(plotData.name_col); // e.g., 'Axis'
    const traceIdx = header.indexOf(plotData.category_col); // e.g., 'Trace'
    const valIdx = header.indexOf(plotData.value_col); // e.g., 'Value'
    if (axisIdx === -1 || traceIdx === -1 || valIdx === -1) return;
    // Gather all axes (theta)
    const allAxes = [];
    for (let i = 1; i < rows.length; ++i) {
      const cols = rows[i].split(',');
      const axis = cols[axisIdx];
      if (axis && !allAxes.includes(axis)) allAxes.push(axis);
    }
    // Group values by trace (shape)
    const dataByTrace = {};
    for (let i = 1; i < rows.length; ++i) {
      const cols = rows[i].split(',');
      const axis = cols[axisIdx];
      const trace = cols[traceIdx];
      const val = parseFloat(cols[valIdx]);
      if (!axis || !trace || isNaN(val)) continue;
      if (!dataByTrace[trace]) dataByTrace[trace] = {};
      dataByTrace[trace][axis] = val;
    }
    // Build traces
    const traces = Object.entries(dataByTrace).map(([traceName, axisVals]) => {
      // Ensure values are in the same order as allAxes
      const r = allAxes.map(axis => axisVals[axis] !== undefined ? axisVals[axis] : 0);
      // Close the loop
      r.push(r[0]);
      const theta = [...allAxes, allAxes[0]];
      return {
        type: 'scatterpolar',
        r,
        theta,
        fill: 'toself',
        name: traceName
      };
    });
    // Layout
    const fontSize = plotData.font_size && plotData.font_size !== '' ? parseInt(plotData.font_size) : 8;
    const layout = {
      title: { text: plotData.title || '', font: { size: 20, family: 'Lato, Arial, sans-serif', color: '#222' }, xref: 'paper', x: 0 },
      polar: {
        radialaxis: {
          visible: true,
          range: [
            plotData.range_min !== '' ? parseFloat(plotData.range_min) : 0,
            plotData.range_max !== '' ? parseFloat(plotData.range_max) : undefined
          ]
        },
        angularaxis: {
          tickfont: { size: fontSize }
        }
      },
      showlegend: plotData.hide_legend === true ? false : true,
      legend: plotData.hide_legend === true ? undefined : {
        orientation: 'h',
        yanchor: 'top',
        y: -0.2,
        xanchor: 'center',
        x: 0
      },
      margin: { t: 60, b: 40, l: 40, r: 40 }
    };
    plotEl.innerHTML = '';
    Plotly.newPlot(plotEl, traces, layout, {displayModeBar: false, responsive: true});
  });
} 