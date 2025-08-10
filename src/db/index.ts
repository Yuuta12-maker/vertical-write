import Dexie, { Table } from 'dexie';
import { Document, AppSettings } from '../types';

export class VerticalWriteDB extends Dexie {
  documents!: Table<Document>;
  settings!: Table<AppSettings>;

  constructor() {
    super('VerticalWriteDB');
    
    this.version(1).stores({
      documents: 'id, title, createdAt, updatedAt',
      settings: 'id'
    });
  }
}

export const db = new VerticalWriteDB();

export const documentService = {
  async getAllDocuments(): Promise<Document[]> {
    return await db.documents.orderBy('updatedAt').reverse().toArray();
  },

  async getDocument(id: string): Promise<Document | undefined> {
    return await db.documents.get(id);
  },

  async saveDocument(document: Document): Promise<string> {
    const now = new Date();
    const docToSave = {
      ...document,
      updatedAt: now,
      createdAt: document.createdAt || now
    };
    
    return await db.documents.put(docToSave);
  },

  async deleteDocument(id: string): Promise<void> {
    await db.documents.delete(id);
  },

  async createDocument(title: string, content: string = ''): Promise<Document> {
    const now = new Date();
    const document: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      createdAt: now,
      updatedAt: now,
      settings: {
        fontSize: 16,
        fontFamily: 'serif',
        lineHeight: 1.8,
        charSpacing: 0,
        pageSize: 'A4'
      }
    };
    
    await this.saveDocument(document);
    return document;
  }
};

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const settings = await db.settings.get('app');
    return settings || {
      id: 'app',
      theme: 'light',
      defaultFontSize: 16,
      defaultFontFamily: 'serif',
      defaultPageSize: 'A4'
    };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await db.settings.put({ ...settings, id: 'app' });
  }
};