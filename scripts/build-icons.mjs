// Generates favicon-192.png, favicon-512.png, apple-touch-icon.png, and favicon.ico from favicon.svg
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import toIco from 'to-ico';

const pub = path.resolve('client/public');
const svg = await fs.readFile(path.join(pub, 'favicon.svg'));

// PNG sizes
const sizes = [192, 512, 180];
const names = ['favicon-192.png', 'favicon-512.png', 'apple-touch-icon.png'];
await Promise.all(sizes.map((s, i) => sharp(svg).resize(s, s).png().toFile(path.join(pub, names[i]))));

// ICO (16,32,48)
const icoBufs = await Promise.all([16,32,48].map(size => sharp(svg).resize(size, size).png().toBuffer()));
const ico = await toIco(icoBufs);
await fs.writeFile(path.join(pub, 'favicon.ico'), ico);

console.log('✓ icons written to client/public');