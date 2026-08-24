$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root

$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$jbr = "C:\Program Files\Android\Android Studio\jbr"

if (-not (Test-Path $sdk)) {
    Write-Host "ERROR: Android SDK not found at $sdk"
    exit 1
}
if (-not (Test-Path "$jbr\bin\java.exe")) {
    Write-Host "ERROR: Android Studio JBR not found at $jbr"
    exit 1
}

$env:ANDROID_HOME = $sdk
$env:JAVA_HOME = $jbr
$env:Path = "$sdk\platform-tools;$sdk\emulator;$jbr\bin;$env:Path"

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "JAVA_HOME=$env:JAVA_HOME"

$avds = @(& "$sdk\emulator\emulator.exe" -list-avds 2>$null | Where-Object { $_ -match '\S' })
if ($avds.Count -gt 0) {
    $running = & "$sdk\platform-tools\adb.exe" devices 2>$null | Select-String "emulator-"
    if (-not $running) {
        $avd = $avds[0]
        Write-Host "Starting emulator: $avd"
        Start-Process -FilePath "$sdk\emulator\emulator.exe" -ArgumentList "-avd", $avd -WindowStyle Normal
        Write-Host "Waiting for emulator (up to 120s)..."
        & "$sdk\platform-tools\adb.exe" wait-for-device 2>$null
        Start-Sleep -Seconds 25
    } else {
        Write-Host "Emulator already running."
    }
} else {
    Write-Host "WARN: No AVD found. Create one in Android Studio: Device Manager -> Create device"
}

$devices = & "$sdk\platform-tools\adb.exe" devices 2>$null | Select-String "device$"
if (-not $devices) {
    Write-Host "ERROR: No emulator/device connected."
    Write-Host "Start emulator: Android Studio -> Device Manager -> Play button on Medium_Phone_API_36.1"
    Write-Host "Or run this script again (it starts the emulator automatically)."
    exit 1
}
$serial = (& "$sdk\platform-tools\adb.exe" devices 2>$null | Select-String "emulator-\d+\s+device" | ForEach-Object { ($_ -split '\s+')[0] } | Select-Object -First 1)
if (-not $serial) {
    $serial = (& "$sdk\platform-tools\adb.exe" devices 2>$null | Select-String "\tdevice$" | ForEach-Object { ($_ -split '\s+')[0] } | Where-Object { $_ -ne "List" } | Select-Object -First 1)
}
$adbArgs = @()
if ($serial) { $adbArgs = @("-s", $serial) }

try {
    $metro = Invoke-WebRequest -Uri "http://127.0.0.1:8081/status" -UseBasicParsing -TimeoutSec 3
    if ($metro.Content -notmatch "running") {
        Write-Host "ERROR: Metro on 8081 is not ready. Run: npm start"
        exit 1
    }
    Write-Host "Metro on 8081: OK"
} catch {
    Write-Host "ERROR: Metro is not running on port 8081."
    Write-Host "In another terminal run: npm start"
    exit 1
}

& "$sdk\platform-tools\adb.exe" @adbArgs reverse tcp:8081 tcp:8081
Write-Host "adb reverse tcp:8081 OK ($serial)"

if ($serial) {
    npx react-native run-android --no-packager --deviceId $serial
} else {
    npx react-native run-android --no-packager
}
