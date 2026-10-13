const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
let count = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('proxiedImageUrl') && 
      !content.includes('import { proxiedImageUrl') && 
      !content.includes('import {proxiedImageUrl')) {
      
    console.log('Fixing missing import in: ' + file);
    const importStmt = 'import { proxiedImageUrl } from "@/lib/utils/proxied-image";\n';
    let newContent;
    
    if (content.includes('"use client";')) {
      newContent = content.replace('"use client";', '"use client";\n' + importStmt);
    } else if (content.includes("'use client';")) {
      newContent = content.replace("'use client';", "'use client';\n" + importStmt);
    } else {
      newContent = importStmt + content;
    }
    
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
  }
});

console.log(`Fixed missing imports in ${count} files.`);
