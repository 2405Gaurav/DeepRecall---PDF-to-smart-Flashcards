const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || '.';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.next') {
        walk(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

const replacements = [
  { regex: /CuemathsAI/g, replacement: 'DeepRecallAI' },
  { regex: /CueMathLoader/g, replacement: 'DeepRecallLoader' },
  { regex: /CuemathHomeShell/g, replacement: 'DeepRecallHomeShell' },
  { regex: /Cuemath/g, replacement: 'DeepRecall' },
  { regex: /cuemath/gi, replacement: 'deeprecall' }
];

walk(dir, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // We do exact replacements first
    content = content.replace(/CuemathsAI/g, 'DeepRecallAI');
    content = content.replace(/CueMathLoader/g, 'DeepRecallLoader');
    content = content.replace(/CuemathHomeShell/g, 'DeepRecallHomeShell');
    content = content.replace(/Cuemath/g, 'DeepRecall');
    content = content.replace(/cuemath/g, 'deeprecall');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
