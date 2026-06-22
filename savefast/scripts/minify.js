const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const FILES_TO_MINIFY = [
  { type: 'css', file: 'css/styles.css' },
  { type: 'js', file: 'js/theme.js' },
  { type: 'js', file: 'js/firebase-config.js' },
  { type: 'js', file: 'js/components.js' },
  { type: 'js', file: 'js/downloader.js' }
];

function minifyCSS(content) {
  return content
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove unnecessary spaces around selectors and brackets
    .replace(/\s*([{}|;:,])\s*/g, '$1')
    // Remove duplicate semicolons
    .replace(/;;+/g, ';')
    // Remove redundant line breaks and spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function minifyJS(content) {
  // Safe JS minification (stripping comments and excessive spacing while preserving strings and regexes)
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;
  let result = '';

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1] || '';

    // Handle block comments
    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    // Handle line comments
    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    // Handle string boundaries
    if (inString) {
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false;
      }
      result += char;
      continue;
    }

    // Detect comment starts
    if (char === '/' && nextChar === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === '/' && nextChar === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    // Detect string starts
    if (char === "'" || char === '"' || char === '`') {
      inString = true;
      stringChar = char;
      result += char;
      continue;
    }

    result += char;
  }

  // Remove multiple empty lines and spaces at start/end of lines
  return result
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    // Replace multiple spaces inside statements
    .replace(/[ \t]+/g, ' ');
}

FILES_TO_MINIFY.forEach(target => {
  const filePath = path.join(ROOT_DIR, target.file);
  try {
    const original = fs.readFileSync(filePath, 'utf8');
    let minified = '';
    if (target.type === 'css') {
      minified = minifyCSS(original);
    } else if (target.type === 'js') {
      minified = minifyJS(original);
    }
    
    fs.writeFileSync(filePath, minified, 'utf8');
    
    const sizeBefore = Buffer.byteLength(original, 'utf8');
    const sizeAfter = Buffer.byteLength(minified, 'utf8');
    const savings = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);
    
    console.log(`Minified ${target.file}: ${sizeBefore}B -> ${sizeAfter}B (${savings}% saved)`);
  } catch (err) {
    console.error(`Failed to minify: ${target.file}`, err);
  }
});

console.log("Minification step completed!");
