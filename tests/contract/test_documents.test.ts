import { describe, it, expect } from 'vitest';
import type { DocumentPreview } from '../../src/types/sources';

describe('Documents API Contract', () => {
  it('should validate document preview structure', () => {
    const mockDocument: DocumentPreview = {
      id: 'doc_123',
      title: 'Project Overview.pdf',
      content_snippet: 'This project focuses on building a chat interface...',
      total_pages: 10,
      file_type: 'application/pdf',
      upload_date: new Date('2025-01-15'),
      size_bytes: 2048576,
    };

    expect(mockDocument.id).toBe('doc_123');
    expect(mockDocument.title).toContain('.pdf');
    expect(mockDocument.size_bytes).toBeGreaterThan(0);
  });

  it('should handle document without optional fields', () => {
    const minimalDocument: DocumentPreview = {
      id: 'doc_456',
      title: 'Simple Text File',
      content_snippet: 'Brief content...',
      file_type: 'text/plain',
      upload_date: new Date(),
      size_bytes: 1024,
    };

    expect(minimalDocument.total_pages).toBeUndefined();
    expect(minimalDocument.file_type).toBe('text/plain');
  });

  it('should support various document types', () => {
    const documentTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];

    documentTypes.forEach(fileType => {
      const document: DocumentPreview = {
        id: `doc_${fileType.replace('/', '_')}`,
        title: `Sample.${fileType.split('/')[1]}`,
        content_snippet: 'Sample content',
        file_type: fileType,
        upload_date: new Date(),
        size_bytes: 1024,
      };

      expect(document.file_type).toBe(fileType);
    });
  });
});
