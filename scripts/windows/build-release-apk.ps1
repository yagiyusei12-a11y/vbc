$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root

if (-not $env:ANDROID_HOME) {
    $defaultSdk = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $defaultSdk) { $env:ANDROID_HOME = $defaultSdk }
}
if (-not $env:JAVA_HOME) {
    $studioJbr = "C:\Program Files\Android\Android Studio\jbr"
    if (Test-Path $studioJbr) { $env:JAVA_HOME = $studioJbr }
}

$keystore = Join-Path $root "android\release.keystore"
$props = Join-Path $root "android\keystore.properties"
if (-not (Test-Path $keystore) -or -not (Test-Path $props)) {
    Write-Host "ERROR: Run 'npm run keystore' first."
    exit 1
}

Set-Location (Join-Path $root "android")
.\gradlew.bat assembleRelease

$apk = Get-ChildItem -Recurse -Path "app\build\outputs\apk\release" -Filter "*.apk" | Select-Object -First 1
if ($apk) { Write-Host "APK: $($apk.FullName)" }
