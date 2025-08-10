# VerticalWrite

日本語縦書き文書作成Webアプリケーション

## 概要

VerticalWriteは、ブラウザ上で日本語の縦書き文書を快適に作成できるWebアプリケーションです。一太郎のような縦書きエディタの軽量Web版として設計されています。

## 主な機能

- ✅ 縦書きテキスト入力・編集
- ✅ 文字サイズ・フォント・行間調整
- ✅ 句読点の適切な配置
- ✅ 数字・英字の縦中横処理
- ✅ ルビ（ふりがな）機能
- ✅ 文書の保存・読み込み（ブラウザ内）
- ✅ テキストファイルのインポート・エクスポート
- ✅ PDF出力（印刷機能）
- ✅ ダークモード対応
- ✅ レスポンシブデザイン

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **スタイリング**: Styled-components
- **データ保存**: IndexedDB（Dexie.js）
- **ビルド**: Vite
- **デプロイ**: GitHub Pages

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/Yuuta12-maker/vertical-write.git
cd vertical-write

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## ビルド・デプロイ

```bash
# プロダクションビルド
npm run build

# GitHub Pagesへのデプロイ
npm run deploy
```

## ディレクトリ構成

```
src/
├── components/          # UIコンポーネント
│   ├── Editor/         # エディタ関連
│   ├── Toolbar/        # ツールバー
│   ├── DocumentList/   # 文書一覧
│   └── Settings/       # 設定画面
├── hooks/              # カスタムフック
├── utils/              # ユーティリティ関数
├── types/              # TypeScript型定義
├── styles/             # グローバルスタイル
└── db/                 # データベース操作
```

## ライセンス

MIT License

## 開発者

[@Yuuta12-maker](https://github.com/Yuuta12-maker)

## 貢献

プルリクエストやイシューの報告をお待ちしています。

---

詳細な要件定義書は [docs/requirements.md](./docs/requirements.md) をご覧ください。