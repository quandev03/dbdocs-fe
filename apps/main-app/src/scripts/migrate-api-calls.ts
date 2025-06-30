#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import glob from 'glob';

/**
 * Migration script để tự động chuyển đổi API calls sang httpClient
 * Chạy: npx ts-node src/scripts/migrate-api-calls.ts
 */

interface MigrationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const migrationRules: MigrationRule[] = [
  // 1. Thay thế fetch() calls
  {
    pattern: /const response = await fetch\(`\${API_BASE_URL}(.*?)`,\s*{[^}]*headers:\s*{[^}]*'Authorization':[^}]*}[^}]*}\);/gs,
    replacement: `const response = await httpClient.get('$1');`,
    description: 'Replace fetch GET with httpClient.get'
  },
  
  // 2. Thay thế fetch() POST calls
  {
    pattern: /const response = await fetch\(`\${API_BASE_URL}(.*?)`,\s*{[^}]*method:\s*['"]POST['"][^}]*}\);/gs,
    replacement: `const response = await httpClient.post('$1', requestBody);`,
    description: 'Replace fetch POST with httpClient.post'
  },
  
  // 3. Thay thế safeApiClient calls
  {
    pattern: /safeApiClient\.get<([^>]+)>\(([^)]+)\)/g,
    replacement: `httpClient.get<$1>($2)`,
    description: 'Replace safeApiClient.get with httpClient.get'
  },
  
  {
    pattern: /safeApiClient\.post<([^>]+)>\(([^)]+)\)/g,
    replacement: `httpClient.post<$1>($2)`,
    description: 'Replace safeApiClient.post with httpClient.post'
  },
  
  {
    pattern: /safeApiClient\.put<([^>]+)>\(([^)]+)\)/g,
    replacement: `httpClient.put<$1>($2)`,
    description: 'Replace safeApiClient.put with httpClient.put'
  },
  
  {
    pattern: /safeApiClient\.delete<([^>]+)>\(([^)]+)\)/g,
    replacement: `httpClient.delete<$1>($2)`,
    description: 'Replace safeApiClient.delete with httpClient.delete'
  },
  
  {
    pattern: /safeApiClient\.patch<([^>]+)>\(([^)]+)\)/g,
    replacement: `httpClient.patch<$1>($2)`,
    description: 'Replace safeApiClient.patch with httpClient.patch'
  },
  
  // 4. Thay thế axios calls (không import từ httpClient)
  {
    pattern: /import axios from ['"]axios['"];/g,
    replacement: `import httpClient from '../services/httpClient';`,
    description: 'Replace axios import with httpClient import'
  },
  
  {
    pattern: /axios\.get\(/g,
    replacement: `httpClient.get(`,
    description: 'Replace axios.get with httpClient.get'
  },
  
  {
    pattern: /axios\.post\(/g,
    replacement: `httpClient.post(`,
    description: 'Replace axios.post with httpClient.post'
  },
  
  {
    pattern: /axios\.put\(/g,
    replacement: `httpClient.put(`,
    description: 'Replace axios.put with httpClient.put'
  },
  
  {
    pattern: /axios\.delete\(/g,
    replacement: `httpClient.delete(`,
    description: 'Replace axios.delete with httpClient.delete'
  },
  
  // 5. Fix response data access
  {
    pattern: /const data = await response\.json\(\);/g,
    replacement: `const data = response.data;`,
    description: 'Replace response.json() with response.data'
  },
  
  {
    pattern: /const ([^=]+) = await response\.json\(\);/g,
    replacement: `const $1 = response.data;`,
    description: 'Replace response.json() with response.data'
  }
];

const importRules = [
  {
    pattern: /import\s+{\s*safeApiClient\s*}\s+from\s+['"][^'"]*['"];?/g,
    replacement: `import httpClient from '../services/httpClient';`,
    description: 'Replace safeApiClient import with httpClient'
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/services\/axios['"];?/g,
    replacement: `from '../services/httpClient';`,
    description: 'Update import path for httpClient'
  }
];

function findFilesToMigrate(): string[] {
  const patterns = [
    'apps/main-app/src/**/*.ts',
    'apps/main-app/src/**/*.tsx',
    '!apps/main-app/src/services/httpClient.ts',
    '!apps/main-app/src/services/axios.ts',
    '!apps/main-app/src/scripts/**/*'
  ];
  
  const files: string[] = [];
  patterns.forEach(pattern => {
    if (pattern.startsWith('!')) {
      // Exclude pattern - remove from files array
      const excludePattern = pattern.slice(1);
      const toExclude = glob.sync(excludePattern);
      files.splice(0, files.length, ...files.filter(f => !toExclude.includes(f)));
    } else {
      files.push(...glob.sync(pattern));
    }
  });
  
  return files;
}

function migrateFile(filePath: string): { success: boolean; changes: number; errors: string[] } {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let changes = 0;
    const errors: string[] = [];
    
    // Apply import rules first
    importRules.forEach(rule => {
      const before = content;
      content = content.replace(rule.pattern, rule.replacement);
      if (content !== before) {
        changes++;
        console.log(`  ✅ ${rule.description}`);
      }
    });
    
    // Apply migration rules
    migrationRules.forEach(rule => {
      const before = content;
      content = content.replace(rule.pattern, rule.replacement);
      if (content !== before) {
        changes++;
        console.log(`  ✅ ${rule.description}`);
      }
    });
    
    // Add httpClient import if needed and not present
    if (changes > 0 && !content.includes('httpClient') && !content.includes('dbdocsApiService')) {
      const importLine = `import httpClient from '../services/httpClient';\n`;
      
      // Find the best place to add import
      const lastImportMatch = content.match(/import[^;]+;(?:\s*\n)*/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const importIndex = content.lastIndexOf(lastImport) + lastImport.length;
        content = content.slice(0, importIndex) + importLine + content.slice(importIndex);
        changes++;
        console.log(`  ✅ Added httpClient import`);
      }
    }
    
    // Write back only if there were changes
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
    }
    
    return { success: true, changes, errors };
  } catch (error) {
    return { 
      success: false, 
      changes: 0, 
      errors: [`Failed to process file: ${error.message}`] 
    };
  }
}

function main() {
  console.log('🚀 Starting API calls migration...\n');
  
  const files = findFilesToMigrate();
  console.log(`📁 Found ${files.length} files to check\n`);
  
  let totalFiles = 0;
  let migratedFiles = 0;
  let totalChanges = 0;
  let errors: string[] = [];
  
  files.forEach(file => {
    totalFiles++;
    console.log(`📄 Processing: ${file}`);
    
    const result = migrateFile(file);
    
    if (result.success) {
      if (result.changes > 0) {
        migratedFiles++;
        totalChanges += result.changes;
        console.log(`  ✨ Migrated with ${result.changes} changes\n`);
      } else {
        console.log(`  ✅ No changes needed\n`);
      }
    } else {
      errors.push(...result.errors.map(e => `${file}: ${e}`));
      console.log(`  ❌ Failed: ${result.errors.join(', ')}\n`);
    }
  });
  
  // Summary
  console.log('📊 Migration Summary:');
  console.log(`  Total files checked: ${totalFiles}`);
  console.log(`  Files migrated: ${migratedFiles}`);
  console.log(`  Total changes: ${totalChanges}`);
  
  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length}`);
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (migratedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('  1. Review the migrated files');
    console.log('  2. Test the application');
    console.log('  3. Commit the changes');
  } else {
    console.log('\nℹ️  No files needed migration.');
  }
}

// Run migration
if (require.main === module) {
  main();
}

export { migrationRules, migrateFile, findFilesToMigrate }; 