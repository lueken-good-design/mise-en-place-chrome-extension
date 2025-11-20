$tempDir = "temp_zip"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir > $null
New-Item -ItemType Directory -Path "$tempDir\images" > $null
Copy-Item manifest.json, sidebar.html, sidebar.js, sidebar.css, background.js -Destination $tempDir
Copy-Item "images\icon16.png", "images\icon48.png", "images\icon128.png", "images\logo.png" -Destination "$tempDir\images"
Remove-Item mise-en-place-extension.zip -ErrorAction SilentlyContinue
Compress-Archive -Path "$tempDir\*" -DestinationPath mise-en-place-extension.zip
Remove-Item -Recurse -Force $tempDir
Write-Host "ZIP created successfully!"
