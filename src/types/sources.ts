export interface SourceAttribution {
  document_id: string;
  document_title: string;
  relevance_score: number;
  content_snippet: string;
  page_number?: number;
  section_title?: string;
  document_url?: string;
  access_url?: string;
}

export interface DocumentPreview {
  id: string;
  title: string;
  content_snippet: string;
  total_pages?: number;
  file_type: string;
  upload_date: Date;
  size_bytes: number;
}
