import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Document, ThemeMode } from '../../types';

const ToolbarContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--accent-color);
  margin: 0;
`;

const DocumentTitle = styled.input`
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  text-align: center;
  min-width: 200px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:focus {
    background-color: var(--bg-primary);
    border: 1px solid var(--accent-color);
  }
  
  &:hover {
    background-color: var(--bg-primary);
  }
`;

const ToolbarButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background-color: ${props => 
    props.variant === 'primary' ? 'var(--accent-color)' : 'var(--bg-primary)'
  };
  color: ${props => 
    props.variant === 'primary' ? 'white' : 'var(--text-primary)'
  };
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => 
      props.variant === 'primary' ? 'var(--accent-color)' : 'var(--bg-secondary)'
    };
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const IconButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border-color);
  background-color: ${props => 
    props.active ? 'var(--accent-color)' : 'var(--bg-primary)'
  };
  color: ${props => 
    props.active ? 'white' : 'var(--text-primary)'
  };
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => 
      props.active ? 'var(--accent-color)' : 'var(--bg-secondary)'
    };
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Separator = styled.div`
  width: 1px;
  height: 1.5rem;
  background-color: var(--border-color);
  margin: 0 0.25rem;
`;

interface ToolbarProps {
  currentDocument: Document | null;
  onCreateDocument: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  theme: ThemeMode;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentDocument,
  onCreateDocument,
  onToggleSidebar,
  onToggleTheme,
  theme
}) => {
  const [documentTitle, setDocumentTitle] = useState(currentDocument?.title || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDocumentTitle(currentDocument?.title || '');
  }, [currentDocument]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (currentDocument && documentTitle.trim() && documentTitle !== currentDocument.title) {
      // Here we would call a function to update the document title
      // For now, we'll just log it
      console.log('Title changed to:', documentTitle);
    }
  };

  const handleExportText = () => {
    if (!currentDocument) return;
    
    const blob = new Blob([currentDocument.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDocument.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      console.log('Imported content:', content);
      // Here we would call a function to create a new document with the imported content
    };
    reader.readAsText(file, 'utf-8');
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (currentDocument) {
      // Manual save trigger - the document is already auto-saved
      console.log('Manual save triggered');
    }
  };

  return (
    <ToolbarContainer>
      <LeftSection>
        <Logo>VerticalWrite</Logo>
        <Separator />
        <ToolbarButton onClick={onCreateDocument} variant="primary">
          📄 新しい文書
        </ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()}>
          📂 開く
        </ToolbarButton>
        <ToolbarButton onClick={handleSave} disabled={!currentDocument}>
          💾 保存
        </ToolbarButton>
        <ToolbarButton onClick={handleExportText} disabled={!currentDocument}>
          📥 エクスポート
        </ToolbarButton>
        <ToolbarButton onClick={handlePrint} disabled={!currentDocument}>
          🖨️ 印刷
        </ToolbarButton>
      </LeftSection>

      <CenterSection>
        {currentDocument && (
          <DocumentTitle
            value={documentTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="文書のタイトル"
          />
        )}
      </CenterSection>

      <RightSection>
        <IconButton onClick={onToggleSidebar} title="サイドバー表示切り替え">
          📋
        </IconButton>
        <IconButton 
          onClick={onToggleTheme} 
          active={theme === 'dark'}
          title="ダークモード切り替え"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </IconButton>
      </RightSection>

      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleImportText}
      />
    </ToolbarContainer>
  );
};

export default Toolbar;