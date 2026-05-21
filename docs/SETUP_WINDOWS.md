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

## 2. 環境変数（PowerShell）

```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

Android Studio 付属 Java（例）:

```powershell
# パスは環境により異なります
$jbr = "C:\Program Files\Android\Android Studio\jbr"
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jbr, "User")
```

**PC を再起動**してからターミナルを開き直してください。

確認:

```powershell
java -version
adb version
```

## 3. プロジェクト

```powershell
cd c:\Users\info\app\vbc
npm install
npm run keystore
npm run android:release
```

## 4. Play Console

[docs/PLAY_STORE.md](./PLAY_STORE.md) を参照。
