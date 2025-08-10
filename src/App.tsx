import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Document, ThemeMode } from './types';
import { documentService, settingsService } from './db';
import Toolbar from './components/Toolbar/Toolbar';
import Editor from './components/Editor/Editor';
import Sidebar from './components/Sidebar/Sidebar';
import './styles/global.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

function App() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const initializeApp = async () => {
    try {
      const settings = await settingsService.getSettings();
      setTheme(settings.theme);
      
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
      
      if (docs.length > 0 && !currentDocument) {
        setCurrentDocument(docs[0]);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const newDocument = await documentService.createDocument('新しい文書');
      setDocuments(prev => [newDocument, ...prev]);
      setCurrentDocument(newDocument);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleSelectDocument = (document: Document) => {
    setCurrentDocument(document);
    setSidebarOpen(false);
  };

  const handleUpdateDocument = async (updatedDocument: Document) => {
    try {
      await documentService.saveDocument(updatedDocument);
      setCurrentDocument(updatedDocument);
      setDocuments(prev => prev.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      ));
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      if (currentDocument?.id === documentId) {
        const remainingDocs = documents.filter(doc => doc.id !== documentId);
        setCurrentDocument(remainingDocs.length > 0 ? remainingDocs[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleToggleTheme = async () => {
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      const settings = await settingsService.getSettings();
      await settingsService.saveSettings({ ...settings, theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  };

  if (isLoading) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: 'var(--text-secondary)'
        }}>
          読み込み中...
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Toolbar
        currentDocument={currentDocument}
        onCreateDocument={handleCreateDocument}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />
      
      <MainContent>
        <Sidebar
          isOpen={sidebarOpen}
          documents={documents}
          currentDocument={currentDocument}
          onSelectDocument={handleSelectDocument}
          onDeleteDocument={handleDeleteDocument}
          onClose={() => setSidebarOpen(false)}
        />
        
        <EditorContainer>
          <Editor
            document={currentDocument}
            onUpdateDocument={handleUpdateDocument}
          />
        </EditorContainer>
      </MainContent>
    </AppContainer>
  );
}

export default App;