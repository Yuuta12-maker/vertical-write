import { Document } from '../types';

/**
 * ファイルをテキストとして読み込む
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * テキストファイルをエクスポート
 */
export function exportAsTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a') as HTMLAnchorElement;
  
  link.href = url;
  link.download = `${filename}.txt`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 文書をJSON形式でエクスポート
 */
export function exportAsJsonFile(doc: Document, filename?: string): void {
  const exportData = {
    document: doc,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a') as HTMLAnchorElement;
  
  link.href = url;
  link.download = `${filename || doc.title}.vw.json`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * JSONファイルから文書をインポート
 */
export async function importFromJsonFile(file: File): Promise<Document> {
  const jsonString = await readFileAsText(file);
  
  try {
    const data = JSON.parse(jsonString);
    
    if (data.document && data.document.id && data.document.title && data.document.content) {
      // IDを新しく生成して重複を避ける
      const importedDocument: Document = {
        ...data.document,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(data.document.createdAt),
        updatedAt: new Date(),
      };
      
      return importedDocument;
    } else {
      throw new Error('Invalid document format');
    }
  } catch (error) {
    throw new Error('Failed to parse JSON file');
  }
}

/**
 * 複数文書をまとめてエクスポート
 */
export function exportMultipleDocuments(documents: Document[], filename: string = 'documents'): void {
  const exportData = {
    documents,
    exportedAt: new Date().toISOString(),
    version: '1.0',
    count: documents.length
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a') as HTMLAnchorElement;
  
  link.href = url;
  link.download = `${filename}.vw-collection.json`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 複数文書のインポート
 */
export async function importMultipleDocuments(file: File): Promise<Document[]> {
  const jsonString = await readFileAsText(file);
  
  try {
    const data = JSON.parse(jsonString);
    
    if (data.documents && Array.isArray(data.documents)) {
      return data.documents.map((doc: any) => ({
        ...doc,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(),
      }));
    } else {
      throw new Error('Invalid collection format');
    }
  } catch (error) {
    throw new Error('Failed to parse collection file');
  }
}

/**
 * RTF形式でエクスポート（簡易版）
 */
export function exportAsRtfFile(content: string, filename: string): void {
  // RTFヘッダーと縦書き設定
  const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
  
  const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a') as HTMLAnchorElement;
  
  link.href = url;
  link.download = `${filename}.rtf`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * HTML形式でエクスポート（印刷用）
 */
export function exportAsHtmlFile(content: string, doc: Document): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.title}</title>
    <style>
        body {
            font-family: "Noto Serif JP", "Yu Mincho", "YuMincho", serif;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: ${doc.settings.fontSize}px;
            line-height: ${doc.settings.lineHeight};
            letter-spacing: ${doc.settings.charSpacing}px;
            padding: 2cm;
            margin: 0;
            background: white;
            color: black;
        }
        .tcy {
            text-combine-upright: all;
        }
        ruby {
            ruby-position: over;
        }
        @page {
            size: ${doc.settings.pageSize === 'A4' ? 'A4' : 'B5'};
            margin: 2cm;
        }
        @media print {
            body {
                background: none;
            }
        }
    </style>
</head>
<body>
    <h1 style="font-size: ${doc.settings.fontSize + 4}px; margin-bottom: 2em;">${doc.title}</h1>
    <div style="white-space: pre-line;">${content}</div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a') as HTMLAnchorElement;
  
  link.href = url;
  link.download = `${doc.title}.html`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * ファイル形式の判定
 */
export function getFileType(file: File): 'text' | 'json' | 'rtf' | 'html' | 'unknown' {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
      return 'text';
    case 'json':
      return 'json';
    case 'rtf':
      return 'rtf';
    case 'html':
    case 'htm':
      return 'html';
    default:
      return 'unknown';
  }
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * ファイル名のサニタイズ
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200); // ファイル名の長さ制限
}