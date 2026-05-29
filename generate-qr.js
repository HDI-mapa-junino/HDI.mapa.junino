const QRCode = require('qrcode');
const path = require('path');

// Get URL from command line or use a default
const url = process.argv[2] || 'https://mapasj-hdi.com.br';

const outputPath = path.join(__dirname, 'qr-code.png');

console.log(`Generating QR Code for: "${url}"...`);

QRCode.toFile(outputPath, url, {
  color: {
    dark: '#006a2c',  // HDI Green (#006a2c)
    light: '#ffffff'  // White background
  },
  width: 1024, // High resolution (1024x1024) for print and digital
  margin: 4
}, function (err) {
  if (err) {
    console.error('Error generating QR Code:', err);
    process.exit(1);
  }
  console.log(`\nSuccess! Branded QR Code generated successfully!`);
  console.log(`Saved to: ${outputPath}`);
  console.log(`Scan this QR code to visit your landing page.`);
});
