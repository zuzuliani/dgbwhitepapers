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
    // Set report metadata
    document.getElementById('report-date').textContent = config.reportDate;
    document.getElementById('report-author').textContent = config.reportAuthor;
    document.querySelector('.cover-title').textContent = config.reportTitle;
    document.querySelector('.cover-subtitle').textContent = config.reportSubtitle;
    document.querySelector('.footer-right').textContent = `© ${new Date().getFullYear()} ${config.companyName}`;

    // Initialize page numbers
    updatePageNumbers();

    // Initialize charts
    initializeCharts();

    // Initialize tables
    initializeTables();
});

// Update page numbers
function updatePageNumbers() {
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach((element, index) => {
        element.textContent = index + 1;
    });
}

// Initialize charts
function initializeCharts() {
    const ctx = document.getElementById('analysisChart').getContext('2d');
    
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
    document.querySelector('.footer-right').textContent = `© ${new Date().getFullYear()} ${config.companyName}`;
} 