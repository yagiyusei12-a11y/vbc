# Windows セットアップ（初回）

## 1. インストール

| ソフト | 用途 |
|--------|------|
| [Node.js 20 LTS](https://nodejs.org/) | JavaScript |
| [Android Studio](https://developer.android.com/studio) | SDK・ビルド |

Android Studio インストール後:

1. **More Actions** → **SDK Manager**
2. **SDK Platforms** → Android 15 (API 35) にチェック
3. **SDK Tools** → Android SDK Build-Tools 35、NDK、CMake にチェック
4. **Apply**

## 2. 環境変数（恒久設定・推奨）

PowerShell を**管理者でなく通常**で実行:

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$jbr = "C:\Program Files\Android\Android Studio\jbr"

[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdk, "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jbr, "User")

$oldPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$add = "$sdk\platform-tools;$sdk\emulator;$jbr\bin"
if ($oldPath -notlike "*platform-tools*") {
  [System.Environment]::SetEnvironmentVariable("Path", "$add;$oldPath", "User")
}
```

**PC を再起動**するか、Cursor / ターミナルをすべて閉じて開き直してください。

確認:

```powershell
java -version
adb version
emulator -list-avds
```

## 2b. 今すぐだけ試す（再起動なし）

```powershell
cd c:\Users\info\app\vbc
npm start
# 別ターミナル
npm run android
```

`npm run android` は `scripts/windows/run-android-dev.ps1` が JAVA_HOME / adb / エミュレータ起動を自動で行います。

## 3. プロジェクト

```powershell
cd c:\Users\info\app\vbc
npm install
npm run keystore
npm run android:release
```

## 4. Play Console

[docs/PLAY_STORE.md](./PLAY_STORE.md) を参照。
