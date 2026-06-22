const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'assets');

fs.readdirSync(srcDir).forEach(file => {
  if (!file.startsWith('girl') || !file.endsWith('.jpg')) return;
  const input = path.join(srcDir, file);
  const num = file.match(/girl(\d+)/)[1];
  const output = path.join(srcDir, `thumb_girl${num}.jpg`);

  sharp(input)
    .resize({ width: 600 })
    .jpeg({ quality: 80 })
    .toFile(output)
    .then(() => console.log(`✓ thumb_girl${num}.jpg ← ${file}`))
    .catch(err => console.error(`✗ ${file}: ${err.message}`));
});
