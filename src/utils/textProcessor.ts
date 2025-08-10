import { RubyText } from '../types';

// 禁則処理用の文字定義
const KINSOKU_START = '。、？！）］｝」』〉》〕〗〙〉》｠»ヽヾゝゞ々ーァィゥェォッャュョヮヵヶ‐';
const KINSOKU_END = '（［｛「『〈《〔〖〘〈《｟«';

// 縦中横処理対象の文字パターン
const TCY_PATTERNS = [
  /\d{1,2}/g, // 1-2桁の数字
  /[A-Za-z]{1,2}/g, // 1-2文字の英字
  /[!?]{1,2}/g, // 感嘆符・疑問符
];

// ルビの正規表現パターン（｜漢字《ひらがな》）
const RUBY_PATTERN = /｜([^《]+)《([^》]+)》/g;

/**
 * 縦中横処理を適用する
 */
export function applyTateChuuYoko(text: string): string {
  let processedText = text;
  
  TCY_PATTERNS.forEach(pattern => {
    processedText = processedText.replace(pattern, (match) => {
      // 既にマークアップされている場合はスキップ
      if (match.includes('<span')) return match;
      return `<span class="tcy">${match}</span>`;
    });
  });
  
  return processedText;
}

/**
 * ルビ処理を適用する
 */
export function applyRuby(text: string): string {
  return text.replace(RUBY_PATTERN, (match, kanji, hiragana) => {
    return `<ruby>${kanji}<rt>${hiragana}</rt></ruby>`;
  });
}

/**
 * 禁則処理をチェックする
 */
export function checkKinsoku(text: string, position: number): {
  canBreakBefore: boolean;
  canBreakAfter: boolean;
} {
  const char = text[position];
  const nextChar = text[position + 1];
  
  return {
    canBreakBefore: !KINSOKU_START.includes(char),
    canBreakAfter: !KINSOKU_END.includes(nextChar || '')
  };
}

/**
 * 句読点の適切な配置処理
 */
export function adjustPunctuation(text: string): string {
  // 全角スペースの正規化
  let processedText = text.replace(/\s+/g, '　');
  
  // 句読点の後の不要な空白を削除
  processedText = processedText.replace(/([。、！？])　+/g, '$1');
  
  // 行頭の句読点を適切に処理
  processedText = processedText.replace(/\n([。、！？])/g, '\n$1');
  
  return processedText;
}

/**
 * 縦書き用の数字変換（必要に応じて）
 */
export function convertNumbersForVertical(text: string): string {
  // 4桁以上の数字は縦中横処理しない
  return text.replace(/\d{4,}/g, (match) => {
    return match.replace(/\d/g, (digit) => {
      const verticalNumbers = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      return verticalNumbers[parseInt(digit)];
    });
  });
}

/**
 * ルビテキストの解析
 */
export function parseRubyText(text: string): RubyText[] {
  const rubyTexts: RubyText[] = [];
  let match;
  
  while ((match = RUBY_PATTERN.exec(text)) !== null) {
    rubyTexts.push({
      text: match[1],
      ruby: match[2],
      position: match.index
    });
  }
  
  return rubyTexts;
}

/**
 * 日本語テキストの総合処理
 */
export function processJapaneseText(text: string, options: {
  enableTcy?: boolean;
  enableRuby?: boolean;
  enableKinsoku?: boolean;
  enablePunctuationAdjustment?: boolean;
  enableVerticalNumbers?: boolean;
} = {}): string {
  let processedText = text;
  
  const {
    enableTcy = true,
    enableRuby = true,
    enableKinsoku = true,
    enablePunctuationAdjustment = true,
    enableVerticalNumbers = false
  } = options;
  
  // ルビ処理
  if (enableRuby) {
    processedText = applyRuby(processedText);
  }
  
  // 句読点の調整
  if (enablePunctuationAdjustment) {
    processedText = adjustPunctuation(processedText);
  }
  
  // 縦書き用数字変換
  if (enableVerticalNumbers) {
    processedText = convertNumbersForVertical(processedText);
  }
  
  // 縦中横処理（HTMLエスケープ後に適用）
  if (enableTcy) {
    processedText = applyTateChuuYoko(processedText);
  }
  
  return processedText;
}

/**
 * 文字数カウント（制御文字を除く）
 */
export function countCharacters(text: string): number {
  return text.replace(/[\r\n\t]/g, '').length;
}

/**
 * 行数カウント
 */
export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

/**
 * 段落数カウント
 */
export function countParagraphs(text: string): number {
  if (!text) return 0;
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
}

/**
 * 文章の読みやすさを評価（簡易版）
 */
export function analyzeReadability(text: string): {
  averageLineLength: number;
  averageParagraphLength: number;
  punctuationRatio: number;
} {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const punctuationCount = (text.match(/[。、！？]/g) || []).length;
  
  return {
    averageLineLength: lines.length > 0 ? lines.reduce((sum, line) => sum + line.length, 0) / lines.length : 0,
    averageParagraphLength: paragraphs.length > 0 ? paragraphs.reduce((sum, para) => sum + para.length, 0) / paragraphs.length : 0,
    punctuationRatio: text.length > 0 ? punctuationCount / text.length : 0
  };
}