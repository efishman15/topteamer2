param([String]$target="release", [String]$crosswalk="true") #Must be the first statement in your script

Function LogMessage
{
 param( [string]$message)
 $now = Get-Date -Format "dd/MM/yyyy hh:mm:ss"
 Write-Host $now --- $message
}


# Take start time
if ($crosswalk -eq "true") {
  LogMessage "Building $target with Crosswalk"
}
else {
  LogMessage "Building $target without Crosswalk"
}

$startTime = Get-Date
LogMessage "Started"

# stop on error
$ErrorActionPreference = "Stop"

$root = "c:\dev\topteamer2"
$androidPlatform = $root + "\platforms\android"
$androidPlatformResources = $root + "\platforms\android\res"
$androidPlatformBuild = $androidPlatform + "\build\outputs\apk"
$appBuildAndroidResources = $root + "\build\android\resources"
$appBuildAndroidApks = $root + "\build\android\apks\" + $target
$plugins = $root + "\plugins"

LogMessage "Deleting previous build files..."
# delete * signing.properties from android platform
If (Test-Path "$androidPlatform\debug-signing.properties") {
  Remove-Item "$androidPlatform\debug-signing.properties"
}
# delete * signing.properties from android platform
If (Test-Path "$androidPlatform\release-signing.properties") {
  Remove-Item "$androidPlatform\release-signing.properties"
}

# delete apk's
If (Test-Path "$androidPlatformBuild\*$target*.apk") {
  Remove-Item "$androidPlatformBuild\*$target*.apk"
}
If (Test-Path "$appBuildAndroidApks\*$target*.apk") {
  Remove-Item "$appBuildAndroidApks\*$target*.apk"
}

LogMessage "Copying resources..."
# copy signing properties
Copy-Item "$appBuildAndroidResources\$target-signing.properties" "$androidPlatform\$target-signing.properties"

# copy resources
Copy-Item -Force "$appBuildAndroidResources\AndroidManifest.xml" "$androidPlatform\AndroidManifest.xml"
Copy-Item -Force "$appBuildAndroidResources\lint.xml" "$androidPlatform\lint.xml"
Copy-Item -Recurse -Force "$appBuildAndroidResources\values\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\values-es\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\values-he\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\values-iw\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\drawable-hdpi\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\drawable-ldpi\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\drawable-mdpi\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\drawable-xhdpi\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\drawable-xxhdpi\" "$androidPlatformResources\"
Copy-Item -Recurse -Force "$appBuildAndroidResources\drawable-xxxhdpi\" "$androidPlatformResources\"

# add crosswalk if needed

if ($crosswalk -eq "true") {
  if (-Not (Test-Path "$plugins\cordova-plugin-crosswalk-webview")) {
    LogMessage "Installing Crosswalk..."
    cordova plugin add cordova-plugin-crosswalk-webview
  }

  # build android app with crosswalk
  LogMessage "Starting ionic build for crosswalk..."
  Invoke-Command -ScriptBlock {ionic build android --$target}

  # check if apk created
  if (-Not (Test-Path "$androidPlatformBuild\android-armv7-$target.apk")) {
    exit
  }

  # check if apk created
  if (-Not (Test-Path "$androidPlatformBuild\android-x86-$target.apk")) {
    exit
  }

  # remove crosswalk --
  LogMessage "Removing Crosswalk..."
  cordova plugin remove cordova-plugin-crosswalk-webview
}

# build android app without crosswalk
LogMessage "Starting standard ionic build (without crosswalk)..."
Invoke-Command -ScriptBlock {ionic build android --$target -- --minSdkVersion=21}

# check if apk created
if (-Not (Test-Path "$androidPlatformBuild\android-$target.apk")) {
  exit
}

# copy apk's to our download folder
LogMessage "Copying apks to app output folder..."

if ($crosswalk -eq "true") {
  Copy-Item "$androidPlatformBuild\android-armv7-$target.apk" "$appBuildAndroidApks\topteamer-armv7-$target.apk"
  Copy-Item "$androidPlatformBuild\android-x86-$target.apk" "$appBuildAndroidApks\topteamer-x86-$target.apk"
}

Copy-Item "$androidPlatformBuild\android-$target.apk" "$appBuildAndroidApks\topteamer-$target.apk"

# writing end time and time span
$endTime = Get-Date
$timeSpan = (New-TimeSpan -Start $startTime -End $endTime).TotalMinutes
LogMessage "Finished within $timeSpan minutes"
exit
