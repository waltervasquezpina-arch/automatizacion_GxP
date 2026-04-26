Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "e:\PRACTICAS_SIST\18_PRACTICAS_CON_IA\Test_13 Automatizacion GxP\plantilla\Generación de FPP 1 - 4_  Plantilla valores.docx"
$extractPath = "e:\PRACTICAS_SIST\18_PRACTICAS_CON_IA\Test_13 Automatizacion GxP\scratch\unzipped"

if (Test-Path $extractPath) { Remove-Item -Recurse -Force $extractPath }
New-Item -ItemType Directory -Force -Path $extractPath

[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractPath)

$xmlPath = Join-Path $extractPath "word\document.xml"
$xmlContent = Get-Content $xmlPath -Raw

# Remove all XML tags to get pure text
$plainText = $xmlContent -replace '<[^>]+>', ''

# Find all occurrences of {{...}}
$matches = [regex]::Matches($plainText, '\{\{.*?\}\}')
$tags = $matches | ForEach-Object { $_.Value } | Select-Object -Unique

Write-Output "Found tags:"
$tags
