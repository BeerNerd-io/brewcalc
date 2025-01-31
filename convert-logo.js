const fs = require('fs');
const path = require('path');

// Update this path to point to your logo file
const logoPath = path.join(__dirname, 'images', 'beernerd-logo.png');
const base64Logo = fs.readFileSync(logoPath, { encoding: 'base64' });

// Output the complete data URL
console.log(`data:image/png;base64,${base64Logo}`); 