# バレーボールのチーム分け

React Native（TypeScript）のローカル保存型バレーボールアプリです。**Expo は使いません。** Windows 上で Android ビルドできます。

## 機能

- メンバー登録（名前・レベル・ポジション）
- チーム編成（参加メンバー選択、4種アルゴリズム、お休み自動割当）
- スコア記録・履歴・JSONバックアップ
- コートチェンジ・自動ローテーション

## 開発（Windows）

```powershell
cd c:\Users\info\app\vbc
npm install
npm start
# 別ターミナル
npm run android
```

要: Node.js 20、Android Studio（SDK 35）

## プライバシーポリシー（Google Play 用）

https://yagiyusei12-a11y.github.io/vbc/privacy-policy.html

## Google Play 用ビルド

詳細は [docs/PLAY_STORE.md](docs/PLAY_STORE.md)

```powershell
npm run keystore          # 初回のみ（署名キー）
npm run android:release   # AAB 作成 → Play Console にアップロード
```

## 構成

```
src/           アプリ本体
android/       Android ネイティブ（Gradle）
scripts/windows/ ビルド用 PowerShell
docs/          Play 申請・プライバシーポリシー
```
