# Corporate White Paper Template

A professional, responsive HTML template for creating corporate white papers and analysis reports. The template is designed to be easily customizable and print-friendly.

## Features

- A4 page formatting
- Professional cover page with background image
- Consistent header and footer across pages
- Responsive design
- Print-friendly layout
- Dynamic content management
- Chart.js integration for data visualization
- Bootstrap integration for responsive tables and layout
- CSS variables for easy theme customization

## File Structure

```
.
├── index.html          # Main HTML file
├── styles/
│   ├── main.css       # Main stylesheet
│   └── print.css      # Print-specific styles
├── js/
│   └── main.js        # JavaScript functionality
└── images/            # Background images and assets
    ├── cover-bg.jpg   # Cover page background
    └── page-bg.jpg    # Content pages background
```

## Usage

1. Clone or download this repository
2. Add your background images to the `images` directory
3. Customize the content in `index.html`
4. Modify the styles in `styles/main.css` to match your brand
5. Update the configuration in `js/main.js`

## Customization

### Theme Colors

Edit the CSS variables in `styles/main.css`:

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #34495e;
    --accent-color: #3498db;
    --text-color: #2c3e50;
    --background-color: #ffffff;
}
```

### Report Configuration

Update the configuration object in `js/main.js`:

```javascript
const config = {
    reportTitle: 'Your Title',
    reportSubtitle: 'Your Subtitle',
    reportDate: 'Your Date',
    reportAuthor: 'Your Name',
    companyName: 'Your Company',
    pageBackground: 'images/your-bg.jpg',
    coverBackground: 'images/your-cover-bg.jpg'
};
```

### Adding Content

Use the provided JavaScript function to add new sections:

```javascript
addContentSection('Section Title', 'Your content here');
```

## Printing

The template is optimized for A4 printing. Use your browser's print function (Ctrl+P or Cmd+P) to print the document. The print styles will automatically format the content for A4 paper.

## Dependencies

- Bootstrap 5.3.0
- Chart.js
- Modern web browser with CSS Grid and Flexbox support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This template is available for use under the MIT License. 