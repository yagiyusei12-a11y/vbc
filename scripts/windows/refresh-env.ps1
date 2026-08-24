# Current terminal only:  . .\scripts\windows\refresh-env.ps1

$sdk = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
$jbr = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }
if (-not $jbr) { $jbr = "C:\Program Files\Android\Android Studio\jbr" }

$env:ANDROID_HOME = $sdk
$env:JAVA_HOME = $jbr

$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$env:Path = "$userPath;$machinePath"

Write-Host "Refreshed for this terminal:"
Write-Host "  ANDROID_HOME = $env:ANDROID_HOME"
Write-Host "  JAVA_HOME    = $env:JAVA_HOME"
& "$sdk\platform-tools\adb.exe" version
& "$jbr\bin\java.exe" -version
