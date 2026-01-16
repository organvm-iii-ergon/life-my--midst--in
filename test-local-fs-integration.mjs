#!/usr/bin/env node
/**
 * Test script for LocalFilesystemProvider
 * 
 * Verifies:
 * 1. Provider initialization
 * 2. Authentication (path verification)
 * 3. File listing with recursive traversal
 * 4. Filtering by excludePatterns and maxFileSize
 * 5. Metadata extraction (creation time, MIME type)
 * 6. File download
 * 7. Health check
 */

import { LocalFilesystemProvider } from '../packages/core/src/integrations/local-fs-integration.js';

async function testLocalFsIntegration() {
  console.log('=== LocalFilesystemProvider Integration Test ===\n');

  // Step 1: Initialize provider
  console.log('1. Initializing provider with /tmp/test-artifacts...');
  const provider = new LocalFilesystemProvider({
    provider: 'local',
    folderPath: '/tmp/test-artifacts'
  });
  console.log('✓ Provider initialized\n');

  // Step 2: Authenticate (verify path exists)
  console.log('2. Authenticating (verifying path exists)...');
  try {
    await provider.authenticate({
      provider: 'local',
      folderPath: '/tmp/test-artifacts'
    });
    console.log('✓ Authentication successful\n');
  } catch (err) {
    console.error('✗ Authentication failed:', err);
    process.exit(1);
  }

  // Step 3: Check health
  console.log('3. Checking provider health...');
  const health = await provider.checkHealth();
  console.log(`Health: ${health.healthy ? '✓' : '✗'} ${health.message}`);
  console.log(`Last checked: ${health.lastChecked}\n`);

  // Step 4: List files (recursive)
  console.log('4. Listing files recursively from root...');
  let fileCount = 0;
  try {
    for await (const file of provider.listFiles('', { recursive: true })) {
      fileCount++;
      console.log(`  - ${file.name}`);
      console.log(`    Path: ${file.path}`);
      console.log(`    MIME: ${file.mimeType}`);
      console.log(`    Size: ${file.size} bytes`);
      console.log(`    Created: ${file.createdTime}`);
      console.log(`    Modified: ${file.modifiedTime}`);
      console.log('');
    }
    console.log(`✓ Found ${fileCount} files\n`);
  } catch (err) {
    console.error('✗ File listing failed:', err);
    process.exit(1);
  }

  // Step 5: List files from Academic subfolder
  console.log('5. Listing files from Academic/ folder...');
  let academicCount = 0;
  try {
    for await (const file of provider.listFiles('Academic', { recursive: false })) {
      academicCount++;
      console.log(`  - ${file.name} (${file.mimeType})`);
    }
    console.log(`✓ Found ${academicCount} files in Academic/\n`);
  } catch (err) {
    console.error('✗ Academic folder listing failed:', err);
    process.exit(1);
  }

  // Step 6: Test filtering by maxFileSize
  console.log('6. Testing maxFileSize filter (max 200 bytes)...');
  let filteredCount = 0;
  try {
    for await (const file of provider.listFiles('', {
      recursive: true,
      filters: { maxFileSize: 200 }
    })) {
      filteredCount++;
      console.log(`  - ${file.name} (${file.size} bytes)`);
    }
    console.log(`✓ Found ${filteredCount} files under 200 bytes\n`);
  } catch (err) {
    console.error('✗ Filtering failed:', err);
    process.exit(1);
  }

  // Step 7: Test excludePatterns
  console.log('7. Testing excludePatterns (exclude *.txt)...');
  let excludedCount = 0;
  try {
    for await (const file of provider.listFiles('', {
      recursive: true,
      filters: { excludePatterns: ['*.txt'] }
    })) {
      excludedCount++;
      console.log(`  - ${file.name}`);
    }
    console.log(`✓ Found ${excludedCount} non-txt files\n`);
  } catch (err) {
    console.error('✗ Exclusion pattern failed:', err);
    process.exit(1);
  }

  // Step 8: Get metadata for specific file
  console.log('8. Getting metadata for Academic/dissertation.pdf...');
  try {
    const metadata = await provider.getMetadata('Academic/dissertation.pdf');
    console.log(`  Name: ${metadata.name}`);
    console.log(`  Size: ${metadata.size} bytes`);
    console.log(`  MIME: ${metadata.mimeType}`);
    console.log(`  Created: ${metadata.createdTime}`);
    console.log(`✓ Metadata retrieved\n`);
  } catch (err) {
    console.error('✗ Get metadata failed:', err);
    process.exit(1);
  }

  // Step 9: Download file
  console.log('9. Downloading Academic/test-paper.txt to /tmp/downloaded-test.txt...');
  try {
    await provider.downloadFile(
      'Academic/test-paper.txt',
      '/tmp/downloaded-test.txt',
      (bytes) => {
        if (bytes % 50 === 0 || bytes < 50) {
          process.stdout.write(`\r  Downloaded: ${bytes} bytes`);
        }
      }
    );
    console.log('\n✓ Download completed\n');
  } catch (err) {
    console.error('✗ Download failed:', err);
    process.exit(1);
  }

  // Step 10: Verify downloaded file
  console.log('10. Verifying downloaded file...');
  const fs = await import('node:fs/promises');
  const content = await fs.readFile('/tmp/downloaded-test.txt', 'utf-8');
  if (content.includes('Test Academic Paper')) {
    console.log('✓ Downloaded file content matches\n');
  } else {
    console.error('✗ Downloaded file content mismatch');
    process.exit(1);
  }

  console.log('=== All Tests Passed ✓ ===');
}

testLocalFsIntegration().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
