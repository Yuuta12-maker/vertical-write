import React, { useState } from 'react';
import styled from 'styled-components';
import { Document } from '../../types';

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '300px' : '0'};
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 200;
    width: ${props => props.isOpen ? '280px' : '0'};
    box-shadow: ${props => props.isOpen ? '2px 0 8px rgba(0, 0, 0, 0.1)' : 'none'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
`;

const SidebarTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 0.875rem;
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const DocumentList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

const DocumentItem = styled.div<{ isActive: boolean }>`
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 0.25rem;
  background-color: ${props => props.isActive ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.isActive ? 'white' : 'var(--text-primary)'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--accent-color)' : 'var(--bg-primary)'};
  }
`;

const DocumentTitle = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DocumentMeta = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DocumentPreview = styled.div`
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-height: 1.2em;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.5;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    background-color: var(--bg-secondary);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

interface SidebarProps {
  isOpen: boolean;
  documents: Document[];
  currentDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onDeleteDocument: (documentId: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  documents,
  currentDocument,
  onSelectDocument,
  onDeleteDocument,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    if (deleteConfirm === documentId) {
      onDeleteDocument(documentId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(documentId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPreviewText = (content: string) => {
    return content.replace(/\n/g, ' ').substring(0, 50);
  };

  const getCharCount = (content: string) => {
    return `${content.length}文字`;
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <CloseButton onClick={onClose}>✕</CloseButton>
      
      <SidebarHeader>
        <SidebarTitle>文書一覧</SidebarTitle>
        <SearchInput
          type="text"
          placeholder="文書を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SidebarHeader>

      <DocumentList>
        {filteredDocuments.length === 0 ? (
          <EmptyState>
            {searchTerm ? '検索結果が見つかりません' : '文書がありません'}
          </EmptyState>
        ) : (
          filteredDocuments.map(doc => (
            <DocumentItem
              key={doc.id}
              isActive={currentDocument?.id === doc.id}
              onClick={() => onSelectDocument(doc)}
            >
              <DocumentTitle>{doc.title}</DocumentTitle>
              <DocumentMeta>
                <span>{formatDate(doc.updatedAt)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{getCharCount(doc.content)}</span>
                  <DeleteButton
                    onClick={(e) => handleDeleteClick(e, doc.id)}
                    title={deleteConfirm === doc.id ? 'もう一度クリックして削除' : '削除'}
                  >
                    {deleteConfirm === doc.id ? '確認' : '🗑️'}
                  </DeleteButton>
                </div>
              </DocumentMeta>
              {doc.content && (
                <DocumentPreview>
                  {getPreviewText(doc.content)}
                </DocumentPreview>
              )}
            </DocumentItem>
          ))
        )}
      </DocumentList>
    </SidebarContainer>
  );
};

export default Sidebar;