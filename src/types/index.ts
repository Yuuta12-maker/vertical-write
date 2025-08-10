export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  settings: DocumentSettings;
}

export interface DocumentSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif';
  lineHeight: number;
  charSpacing: number;
  pageSize: 'A4' | 'B5' | 'custom';
  customPageWidth?: number;
  customPageHeight?: number;
}

export interface EditorState {
  currentDocument: Document | null;
  documents: Document[];
  isLoading: boolean;
  isDarkMode: boolean;
}

export interface RubyText {
  text: string;
  ruby: string;
  position: number;
}

export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  id?: string;
  theme: ThemeMode;
  defaultFontSize: number;
  defaultFontFamily: 'serif' | 'sans-serif';
  defaultPageSize: 'A4' | 'B5' | 'custom';
}