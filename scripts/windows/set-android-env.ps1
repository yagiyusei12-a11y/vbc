# Run before development:  . .\scripts\windows\set-android-env.ps1
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$jbr = "C:\Program Files\Android\Android Studio\jbr"

$env:ANDROID_HOME = $sdk
$env:JAVA_HOME = $jbr
$env:Path = "$sdk\platform-tools;$sdk\emulator;$jbr\bin;$env:Path"

Write-Host "OK: ANDROID_HOME, JAVA_HOME, adb, emulator added to this session."
