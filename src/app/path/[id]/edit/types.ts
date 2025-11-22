// Types for the editor page

export interface PathData {
  id: string;
  title: string;
  subtitle: string;
}

export interface Column {
  id: string;
  path_id: string;
  parent_item_id: string | null;
  type: 'branch' | 'content' | 'dynamic';
  title: string;
  order_index: number;
}

export interface ColumnItem {
  id: string;
  column_id: string;
  title: string;
  order_index: number;
}

export interface ContentSection {
  id: string;
  column_id: string; // Changed from item_id to column_id
  type: string;
  content: any;
  order_index: number;
}
