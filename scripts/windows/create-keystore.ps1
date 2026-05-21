$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$keystore = Join-Path $root "android\release.keystore"

if (Test-Path $keystore) {
    Write-Host "Keystore already exists: $keystore"
    exit 0
}

$keytoolCmd = "keytool"
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    $studioJbr = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
    if (Test-Path $studioJbr) {
        $keytoolCmd = $studioJbr
    } else {
        Write-Host "ERROR: keytool not found. Install Android Studio or add JDK to PATH."
        exit 1
    }
}

Write-Host "Creating release keystore (valid 25 years)..."
& $keytoolCmd -genkeypair -v `
  -storetype PKCS12 `
  -keystore $keystore `
  -alias vbc-release `
  -keyalg RSA `
  -keysize 2048 `
  -validity 9125 `
  -storepass vbcRelease2026 `
  -keypass vbcRelease2026 `
  -dname "CN=VBC Team Divider, OU=Mobile, O=Developer, L=Tokyo, ST=Tokyo, C=JP"

$props = Join-Path $root "android\keystore.properties"
if (-not (Test-Path $props)) {
    @(
        "storeFile=../release.keystore"
        "storePassword=vbcRelease2026"
        "keyAlias=vbc-release"
        "keyPassword=vbcRelease2026"
    ) | Set-Content $props -Encoding ASCII
    Write-Host "Created android\keystore.properties - change passwords before production!"
}

Write-Host "Done: $keystore"
