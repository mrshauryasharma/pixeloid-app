const fs = require('fs');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.floor(size*0.22)}" fill="url(#g)"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".1em" font-size="${Math.floor(size*0.45)}" fill="white" font-family="Arial" font-weight="bold">🚀</text>
  </svg>`;
  
  fs.writeFileSync(`public/icons/icon-${size}.svg`, svg);
  console.log(`✅ icon-${size}.svg`);
});

console.log('\n🎉 All icons created!');