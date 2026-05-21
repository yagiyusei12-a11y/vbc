$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root

if (-not $env:ANDROID_HOME) {
    $defaultSdk = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
        Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
    } else {
        Write-Host "ERROR: ANDROID_HOME not set. See docs/SETUP_WINDOWS.md"
        exit 1
    }
}

if (-not $env:JAVA_HOME) {
    $studioJbr = "C:\Program Files\Android\Android Studio\jbr"
    if (Test-Path $studioJbr) {
        $env:JAVA_HOME = $studioJbr
        Write-Host "JAVA_HOME=$env:JAVA_HOME"
    } else {
        Write-Host "ERROR: JAVA_HOME not set. Install Android Studio or set JAVA_HOME."
        exit 1
    }
}

$keystore = Join-Path $root "android\release.keystore"
$props = Join-Path $root "android\keystore.properties"
if (-not (Test-Path $keystore) -or -not (Test-Path $props)) {
    Write-Host "ERROR: Run 'npm run keystore' first."
    exit 1
}

Write-Host "Building Google Play AAB..."
Set-Location (Join-Path $root "android")
.\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Gradle build failed (exit $LASTEXITCODE)."
    exit $LASTEXITCODE
}

$aabDir = Join-Path $root "android\app\build\outputs\bundle\release"
if (-not (Test-Path $aabDir)) {
    Write-Host "ERROR: Output folder not found: $aabDir"
    exit 1
}

$aab = Get-ChildItem -Path $aabDir -Filter "*.aab" | Select-Object -First 1
if ($aab) {
    Write-Host ""
    Write-Host "Build OK:"
    Write-Host $aab.FullName
} else {
    Write-Host "ERROR: AAB not found in $aabDir"
    exit 1
}
