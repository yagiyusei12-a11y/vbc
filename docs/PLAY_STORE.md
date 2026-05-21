# Google Play 申請ガイド（Windows ローカルビルド）

**Expo / EAS は使いません。** Windows + Android Studio + Gradle で AAB を作成します。

| 項目 | 値 |
|------|-----|
| アプリ名 | バレーボールのチーム分け |
| パッケージ名 | `app.vbc.teamdivider` |
| バージョン | 1.0.0 (versionCode 1) |

---

## 1. 必要なソフト（初回のみ）

1. [Node.js 20 LTS](https://nodejs.org/)
2. [Android Studio](https://developer.android.com/studio)
   - SDK Platform 35
   - Android SDK Build-Tools 35
   - NDK（Studio が案内するもの）
3. 環境変数（PowerShell で確認）:
   - `ANDROID_HOME` = `C:\Users\<あなた>\AppData\Local\Android\Sdk`
   - `PATH` に `%ANDROID_HOME%\platform-tools` を追加

```powershell
cd c:\Users\info\app\vbc
npm install
```

---

## 2. 実機テスト（開発ビルド）

```powershell
npm start
# 別ターミナルで
npm run android
```

---

## 3. リリース署名の準備（初回のみ）

```powershell
npm run keystore
```

- `android\release.keystore` が作成されます
- `android\keystore.properties` が作成されます
- **本番前にパスワードを必ず変更**してください（`keystore.properties` と keytool で作り直し可）

`keystore.properties` と `release.keystore` は **git にコミットしない**でください。

---

## 4. Google Play 用 AAB をビルド

```powershell
npm run android:release
```

成功すると次のようなファイルができます:

```
android\app\build\outputs\bundle\release\app-release.aab
```

この `.aab` を Play Console にアップロードします。

---

## 5. Google Play Console

1. [Play Console](https://play.google.com/console) で開発者登録（$25）
2. **アプリを作成** → パッケージ名 `app.vbc.teamdivider`（変更不可）
3. **プライバシーポリシー URL**（必須）  
   プライバシーポリシー URL: https://yagiyusei12-a11y.github.io/vbc/privacy-policy.html
4. **ストアの掲載情報**（説明文・スクリーンショット）
5. **アプリのコンテンツ** → データ セーフティ  
   - データ収集: なし（すべて端末内保存）
6. **リリース** → **内部テスト** または **本番** → AAB をアップロード

### スクリーンショット

実機またはエミュレータで `npm run android` し、画面をキャプチャ（2枚以上）。

---

## 6. バージョンアップ時

1. `android/app/build.gradle` の `versionCode` を +1、`versionName` を更新（例: 1.0.1）
2. `package.json` の `version` も合わせる
3. `npm run android:release` で再ビルド

---

## チェックリスト

- [ ] Android Studio / SDK インストール済み
- [ ] `npm install` 済み
- [ ] `npm run keystore` で署名作成
- [ ] `npm run android:release` で AAB 取得
- [ ] プライバシーポリシー URL を公開
- [ ] Play Console に AAB アップロード

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `ANDROID_HOME` エラー | Android Studio → SDK の場所を環境変数に設定 |
| Gradle 失敗 | `cd android` → `.\gradlew.bat clean` → 再ビルド |
| JDK エラー | Android Studio 付属 JBR を `JAVA_HOME` に設定 |
