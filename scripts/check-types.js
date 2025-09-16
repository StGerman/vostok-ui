#!/usr/bin/env node

/**
 * Type Safety Validation Script
 * Scans for remaining 'any' types and other type safety violations
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = './src';
const VIOLATIONS = {
  any: /:\s*any\b|<any>|as\s+any\b|any\[\]/g,
  implicitAny: /\(\s*\w+\s*\)/g, // Functions without parameter types
  noReturn: /function\s+\w+\s*\([^)]*\)\s*{/g, // Functions without return types
};

let totalViolations = 0;
const violationsByFile = new Map();

/**
 * Recursively scan directory for TypeScript files
 */
function scanDirectory(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && ['.ts', '.tsx'].includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Check file for type safety violations
 */
function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const violations = [];

    // Check for 'any' usage
    const anyMatches = content.match(VIOLATIONS.any);
    if (anyMatches) {
      violations.push({
        type: 'explicit-any',
        count: anyMatches.length,
        matches: anyMatches
      });
    }

    // Check for missing return types (basic check)
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('function ') && !line.includes('):') && !line.includes('=> ')) {
        violations.push({
          type: 'missing-return-type',
          line: index + 1,
          content: line.trim()
        });
      }
    });

    if (violations.length > 0) {
      violationsByFile.set(filePath, violations);
      totalViolations += violations.reduce((sum, v) => sum + (v.count || 1), 0);
    }

    return violations.length === 0;
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Run TypeScript compiler to check for compilation errors
 */
function runTypeCheck() {
  try {
    console.log('Running TypeScript compiler...');
    execSync('npm run type-check', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('❌ TypeScript compilation failed:');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning for type safety violations...\n');

  // Check TypeScript compilation
  const compileSuccess = runTypeCheck();
  console.log('');

  // Scan source files
  const files = scanDirectory(SRC_DIR);
  console.log(`Scanning ${files.length} TypeScript files...`);

  let cleanFiles = 0;

  for (const file of files) {
    const isClean = checkFile(file);
    if (isClean) {
      cleanFiles++;
    }
  }

  // Report results
  console.log('\n📊 Type Safety Report:');
  console.log(`  Clean files: ${cleanFiles}/${files.length}`);
  console.log(`  Files with violations: ${violationsByFile.size}`);
  console.log(`  Total violations: ${totalViolations}`);

  if (violationsByFile.size > 0) {
    console.log('\n❌ Violations found:');

    for (const [file, violations] of violationsByFile) {
      console.log(`\n  ${file}:`);

      for (const violation of violations) {
        if (violation.type === 'explicit-any') {
          console.log(`    - ${violation.count} explicit 'any' usage(s)`);
          violation.matches.forEach(match => {
            console.log(`      ${match}`);
          });
        } else if (violation.type === 'missing-return-type') {
          console.log(`    - Missing return type at line ${violation.line}: ${violation.content}`);
        }
      }
    }
  }

  // Exit with error code if violations found or compilation failed
  const success = compileSuccess && totalViolations === 0;

  if (success) {
    console.log('\n✅ All type safety checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Type safety violations detected. Please fix before proceeding.');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as checkTypes };
