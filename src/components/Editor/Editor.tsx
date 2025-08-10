import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Document, DocumentSettings } from '../../types';
import { processJapaneseText } from '../../utils/textProcessor';

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow: hidden;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  overflow: auto;
  background-color: var(--bg-secondary);
`;

const PaperContainer = styled.div<{ pageSize: string; fontSize: number }>`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  min-height: ${props => {
    const sizes = {
      A4: '297mm',
      B5: '257mm',
      custom: '400px'
    };
    return sizes[props.pageSize as keyof typeof sizes] || sizes.A4;
  }};
  width: ${props => {
    const sizes = {
      A4: '210mm',
      B5: '182mm', 
      custom: '300px'
    };
    return sizes[props.pageSize as keyof typeof sizes] || sizes.A4;
  }};
  padding: 2rem;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: 500px;
    margin: 0 1rem;
  }
`;

const VerticalTextEditor = styled.div<{ 
  fontSize: number; 
  fontFamily: string;
  lineHeight: number;
  charSpacing: number;
}>`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: ${props => props.fontSize}px;
  font-family: ${props => props.fontFamily === 'serif' 
    ? '"Noto Serif JP", "Yu Mincho", "YuMincho", "Hiragino Mincho Pro", serif'
    : '"Noto Sans JP", "Yu Gothic", "YuGothic", "Hiragino Sans", sans-serif'
  };
  line-height: ${props => props.lineHeight};
  letter-spacing: ${props => props.charSpacing}px;
  color: var(--text-primary);
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  padding: 1rem;
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: var(--text-primary);
  min-width: fit-content;
`;

const Select = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 0.875rem;
`;

const RangeInput = styled.input`
  width: 100px;
`;

const NumberInput = styled.input`
  width: 60px;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 0.875rem;
`;

interface EditorProps {
  document: Document | null;
  onUpdateDocument: (document: Document) => void;
}

const Editor: React.FC<EditorProps> = ({ document, onUpdateDocument }) => {
  const [content, setContent] = useState('');
  const [settings, setSettings] = useState<DocumentSettings>({
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 1.8,
    charSpacing: 0,
    pageSize: 'A4'
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (document) {
      setContent(document.content);
      setSettings(document.settings);
    } else {
      setContent('');
    }
  }, [document]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (document) {
      const updatedDocument = {
        ...document,
        content: newContent,
        updatedAt: new Date()
      };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        onUpdateDocument(updatedDocument);
      }, 1000);
    }
  }, [document, onUpdateDocument]);

  const handleSettingChange = useCallback((key: keyof DocumentSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (document) {
      const updatedDocument = {
        ...document,
        settings: newSettings,
        updatedAt: new Date()
      };
      onUpdateDocument(updatedDocument);
    }
  }, [settings, document, onUpdateDocument]);

  const getCharacterCount = () => content.length;
  const getLineCount = () => content.split('\n').length;

  if (!document) {
    return (
      <EditorContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: 'var(--text-secondary)'
        }}>
          文書を選択するか、新しい文書を作成してください
        </div>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <ControlPanel>
        <ControlGroup>
          <Label>文字サイズ:</Label>
          <NumberInput
            type="number"
            min="12"
            max="32"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>px</span>
        </ControlGroup>

        <ControlGroup>
          <Label>フォント:</Label>
          <Select
            value={settings.fontFamily}
            onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
          >
            <option value="serif">明朝体</option>
            <option value="sans-serif">ゴシック体</option>
          </Select>
        </ControlGroup>

        <ControlGroup>
          <Label>行間:</Label>
          <RangeInput
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={settings.lineHeight}
            onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '2rem' }}>
            {settings.lineHeight.toFixed(1)}
          </span>
        </ControlGroup>

        <ControlGroup>
          <Label>文字間隔:</Label>
          <RangeInput
            type="range"
            min="-2"
            max="4"
            step="0.5"
            value={settings.charSpacing}
            onChange={(e) => handleSettingChange('charSpacing', parseFloat(e.target.value))}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '2rem' }}>
            {settings.charSpacing}px
          </span>
        </ControlGroup>

        <ControlGroup>
          <Label>用紙サイズ:</Label>
          <Select
            value={settings.pageSize}
            onChange={(e) => handleSettingChange('pageSize', e.target.value)}
          >
            <option value="A4">A4</option>
            <option value="B5">B5</option>
            <option value="custom">カスタム</option>
          </Select>
        </ControlGroup>
      </ControlPanel>

      <EditorWrapper>
        <PaperContainer pageSize={settings.pageSize} fontSize={settings.fontSize}>
          <VerticalTextEditor
            as="textarea"
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            fontSize={settings.fontSize}
            fontFamily={settings.fontFamily}
            lineHeight={settings.lineHeight}
            charSpacing={settings.charSpacing}
            placeholder="ここに縦書きで文章を入力してください..."
            spellCheck={false}
          />
        </PaperContainer>
      </EditorWrapper>

      <StatusBar>
        <div>
          文書: {document.title}
        </div>
        <div>
          文字数: {getCharacterCount()} | 行数: {getLineCount()}
        </div>
      </StatusBar>
    </EditorContainer>
  );
};

export default Editor;