export interface BlogPost {
  id: string; // UUID
  title: string;
  short_description?: string;
  content: any; // EditorJS content format
  author: string;
  published_date: string;
  created_at: string;
}

export interface BlogPostListItem {
  id: string; // UUID
  title: string;
  short_description?: string;
  author: string;
  published_date: string;
  excerpt?: string;
}
