import type { SourceAttribution, DocumentPreview } from '../types/sources';

export class SourceService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  /**
   * Fetch document preview by ID
   */
  async getDocumentPreview(documentId: string): Promise<DocumentPreview> {
    try {
      const response = await fetch(`${this.baseURL}/documents/${documentId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }

      return await response.json() as DocumentPreview;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load document preview: ${message}`);
    }
  }

  /**
   * Search documents by query
   */
  async searchDocuments(
    query: string,
    options?: {
      maxResults?: number;
      similarityThreshold?: number;
      documentTypes?: string[];
    }
  ): Promise<{
    documents: Array<{
      id: string;
      title: string;
      relevance_score: number;
      snippet: string;
      file_type: string;
    }>;
    total_found: number;
    search_time_ms: number;
    query_processed: string;
  }> {
    try {
      const searchParams = new URLSearchParams({
        query,
        max_results: (options?.maxResults || 10).toString(),
        similarity_threshold: (options?.similarityThreshold || 0.7).toString(),
      });

      if (options?.documentTypes?.length) {
        searchParams.append('document_types', options.documentTypes.join(','));
      }

      const response = await fetch(`${this.baseURL}/documents/search?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Document search failed: ${message}`);
    }
  }

  /**
   * Get document access URL for preview/download
   */
  getDocumentAccessUrl(documentId: string, page?: number): string {
    let url = `${this.baseURL}/documents/${documentId}/preview`;
    if (page !== undefined) {
      url += `?page=${page}`;
    }
    return url;
  }

  /**
   * Sort sources by relevance score (descending)
   */
  sortSourcesByRelevance(sources: SourceAttribution[]): SourceAttribution[] {
    return [...sources].sort((a, b) => b.relevance_score - a.relevance_score);
  }

  /**
   * Filter sources by minimum relevance threshold
   */
  filterSourcesByRelevance(
    sources: SourceAttribution[],
    threshold: number = 0.7
  ): SourceAttribution[] {
    return sources.filter(source => source.relevance_score >= threshold);
  }

  /**
   * Group sources by document
   */
  groupSourcesByDocument(sources: SourceAttribution[]): Map<string, SourceAttribution[]> {
    const grouped = new Map<string, SourceAttribution[]>();

    for (const source of sources) {
      const existing = grouped.get(source.document_id) || [];
      existing.push(source);
      grouped.set(source.document_id, existing);
    }

    return grouped;
  }

  /**
   * Format source attribution for display
   */
  formatSourceForDisplay(source: SourceAttribution, options?: {
    maxTitleLength?: number;
    maxSnippetLength?: number;
  }): {
    displayTitle: string;
    displaySnippet: string;
    relevancePercent: number;
    accessUrl: string;
  } {
    const maxTitleLength = options?.maxTitleLength || 40;
    const maxSnippetLength = options?.maxSnippetLength || 150;

    const displayTitle = source.document_title.length > maxTitleLength
      ? `${source.document_title.substring(0, maxTitleLength)}...`
      : source.document_title;

    const displaySnippet = source.content_snippet.length > maxSnippetLength
      ? `${source.content_snippet.substring(0, maxSnippetLength)}...`
      : source.content_snippet;

    const relevancePercent = Math.round(source.relevance_score * 100);
    const accessUrl = source.access_url || this.getDocumentAccessUrl(source.document_id, source.page_number);

    return {
      displayTitle,
      displaySnippet,
      relevancePercent,
      accessUrl,
    };
  }

  /**
   * Validate source attribution structure
   */
  isValidSourceAttribution(source: unknown): source is SourceAttribution {
    if (!source || typeof source !== 'object') {
      return false;
    }

    const src = source as Partial<SourceAttribution>;

    return (
      typeof src.document_id === 'string' &&
      typeof src.document_title === 'string' &&
      typeof src.relevance_score === 'number' &&
      typeof src.content_snippet === 'string' &&
      src.relevance_score >= 0 &&
      src.relevance_score <= 1
    );
  }

  /**
   * Extract unique documents from source attributions
   */
  getUniqueDocuments(sources: SourceAttribution[]): Array<{
    id: string;
    title: string;
    sourceCount: number;
    avgRelevance: number;
  }> {
    const documentMap = new Map<string, {
      title: string;
      sources: SourceAttribution[];
    }>();

    // Group sources by document
    for (const source of sources) {
      const existing = documentMap.get(source.document_id);
      if (existing) {
        existing.sources.push(source);
      } else {
        documentMap.set(source.document_id, {
          title: source.document_title,
          sources: [source],
        });
      }
    }

    // Calculate metrics for each document
    return Array.from(documentMap.entries()).map(([id, data]) => ({
      id,
      title: data.title,
      sourceCount: data.sources.length,
      avgRelevance: data.sources.reduce((sum, src) => sum + src.relevance_score, 0) / data.sources.length,
    }));
  }

  /**
   * Create a citation string for sources
   */
  createCitation(sources: SourceAttribution[]): string {
    const uniqueDocs = this.getUniqueDocuments(sources);
    return uniqueDocs
      .map((doc, index) => `[${index + 1}] ${doc.title}`)
      .join('; ');
  }
}

// Default service instance
export const sourceService = new SourceService();
