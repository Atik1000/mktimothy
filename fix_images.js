const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components'];
const IMPORT_STATEMENT = `import { proxiedImageUrl } from "@/lib/utils/proxied-image";\n`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Check if file has tsx or ts extension
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let hasChanges = false;

  // Patterns to replace (we need to be careful to only replace unproxied DB fields)
  // E.g., src={user.avatar} -> src={proxiedImageUrl(user.avatar)}
  // E.g., src={blog.coverImage} -> src={proxiedImageUrl(blog.coverImage)}
  // E.g., src={listing.images[0]} -> src={proxiedImageUrl(listing.images[0])}
  // E.g., src={business.images[0]} -> src={proxiedImageUrl(business.images[0])}
  // E.g., src={article.image} -> src={proxiedImageUrl(article.image)}
  // E.g., src={category.image} -> src={proxiedImageUrl(category.image)}
  // E.g., src={chat.avatar} -> src={proxiedImageUrl(chat.avatar)}
  // E.g., src={message.imageUrl} -> src={proxiedImageUrl(message.imageUrl)}
  
  const patterns = [
    /src=\{([^}]*(?:avatar|image|coverImage|imageUrl|videoUrl|thumbnail|images\[\d+\])[^}]*)\}/gi
  ];

  for (const pattern of patterns) {
    content = content.replace(pattern, (match, innerExpr) => {
      // Ignore if already wrapped, or if it's a URL.createObjectURL, or getMapImageUrl(), etc.
      if (innerExpr.includes('proxiedImageUrl') || 
          innerExpr.includes('URL.createObjectURL') ||
          innerExpr.includes('getMapImageUrl') ||
          innerExpr.includes('https://flagcdn.com') ||
          innerExpr.includes('getPostImage')) {
        return match;
      }
      
      // If the inner expression is a string literal starting with / or http, skip
      if (/^[`'"]/.test(innerExpr.trim()) && !innerExpr.includes('$')) {
         return match;
      }

      hasChanges = true;
      return `src={proxiedImageUrl(${innerExpr})}`;
    });
  }

  // Also replace src={`${listing.images[0]}`} -> src={proxiedImageUrl(listing.images[0])}
  const templatePatterns = [
    /src=\{`\$\{([^}]*(?:avatar|image|coverImage|images\[\d+\])[^}]*)\}`\}/gi
  ];
  for (const pattern of templatePatterns) {
     content = content.replace(pattern, (match, innerExpr) => {
      if (innerExpr.includes('proxiedImageUrl')) return match;
      hasChanges = true;
      return `src={proxiedImageUrl(${innerExpr})}`;
    });
  }

  if (hasChanges) {
    // Add import if not present
    if (!content.includes('proxiedImageUrl')) {
      // Find the last import statement or "use client" to inject the import
      const lines = content.split('\n');
      let insertIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIdx = i;
        }
      }
      // insert after the last import
      if (insertIdx > 0) {
        lines.splice(insertIdx + 1, 0, IMPORT_STATEMENT.trim());
      } else {
        // if no imports, insert after "use client" or at top
        if (lines[0].includes('use client')) {
           lines.splice(1, 0, '\n' + IMPORT_STATEMENT.trim());
        } else {
           lines.splice(0, 0, IMPORT_STATEMENT.trim());
        }
      }
      content = lines.join('\n');
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
       walkDir(fullPath);
    } else {
       processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(dir => {
   walkDir(path.join(process.cwd(), dir));
});
console.log('Done.');
