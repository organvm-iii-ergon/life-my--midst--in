/**
 * Test script for LocalFilesystemProvider
 * 
 * Run with: pnpm --filter @in-midst-my-life/core test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { LocalFilesystemProvider } from '../src/integrations/local-fs-integration';

describe('LocalFilesystemProvider', () => {
  const testPath = '/tmp/test-artifacts';

  beforeAll(async () => {
    // Create test directory and files
    await mkdir(`${testPath}/Academic`, { recursive: true });
    await writeFile(`${testPath}/Academic/test-paper.txt`, 'Test content');
    await writeFile(`${testPath}/Academic/dissertation.pdf`, '%PDF-1.4\nTest PDF');
  });

  it('should initialize with valid folder path', () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });
    expect(provider.name).toBe('local');
  });

  it('should authenticate successfully', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });
    await expect(provider.authenticate({ provider: 'local', folderPath: testPath })).resolves.not.toThrow();
  });

  it('should fail authentication with invalid path', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: '/nonexistent/path'
    });
    await expect(provider.authenticate({ provider: 'local', folderPath: '/nonexistent/path' })).rejects.toThrow();
  });

  it('should list files recursively', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const files: any[] = [];
    for await (const file of provider.listFiles('', { recursive: true })) {
      files.push(file);
    }

    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.name === 'test-paper.txt')).toBe(true);
    expect(files.some(f => f.name === 'dissertation.pdf')).toBe(true);
  });

  it('should filter files by maxFileSize', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const files: any[] = [];
    for await (const file of provider.listFiles('', {
      recursive: true,
      filters: { maxFileSize: 50 }
    })) {
      files.push(file);
    }

    files.forEach(file => {
      expect(file.size).toBeLessThanOrEqual(50);
    });
  });

  it('should exclude files by pattern', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const files: any[] = [];
    for await (const file of provider.listFiles('', {
      recursive: true,
      filters: { excludePatterns: ['*.txt'] }
    })) {
      files.push(file);
    }

    expect(files.every(f => !f.name.endsWith('.txt'))).toBe(true);
  });

  it('should get metadata for specific file', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const metadata = await provider.getMetadata('Academic/test-paper.txt');
    expect(metadata.name).toBe('test-paper.txt');
    expect(metadata.mimeType).toBe('text/plain');
    expect(metadata.size).toBeGreaterThan(0);
    expect(metadata.createdTime).toBeDefined();
    expect(metadata.modifiedTime).toBeDefined();
  });

  it('should download file successfully', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const destPath = '/tmp/test-download.txt';
    await provider.downloadFile('Academic/test-paper.txt', destPath);

    const fs = await import('node:fs/promises');
    const content = await fs.readFile(destPath, 'utf-8');
    expect(content).toContain('Test content');
  });

  it('should check health successfully', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const health = await provider.checkHealth();
    expect(health.healthy).toBe(true);
    expect(health.provider).toBe('local');
    expect(health.message).toContain('accessible');
  });

  it('should report unhealthy for invalid path', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: '/nonexistent/path'
    });

    const health = await provider.checkHealth();
    expect(health.healthy).toBe(false);
  });

  it('should preserve file creation times', async () => {
    const provider = new LocalFilesystemProvider({
      provider: 'local',
      folderPath: testPath
    });

    const metadata = await provider.getMetadata('Academic/test-paper.txt');
    expect(metadata.createdTime).toBeDefined();
    expect(metadata.modifiedTime).toBeDefined();
    
    // Verify ISO 8601 format
    expect(new Date(metadata.createdTime).toISOString()).toBe(metadata.createdTime);
    expect(new Date(metadata.modifiedTime).toISOString()).toBe(metadata.modifiedTime);
  });
});
