Add-Type -AssemblyName System.IO.Compression.FileSystem

$baseDir = Split-Path -Parent $PSScriptRoot
$extDir = Join-Path $baseDir "extension"
$zipPath = Join-Path $baseDir "pokeskip-extension.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$items = Get-ChildItem -Path $extDir -Recurse -File
foreach ($item in $items) {
    $relPath = $item.FullName.Substring($extDir.Length + 1)
    $entryName = $relPath.Replace("\", "/")
    Write-Host "Adding $entryName"
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $item.FullName, $entryName)
}

$zip.Dispose()
Write-Host "`nSuccessfully created $zipPath"

$zipRead = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "`nListing entries in zip:"
$zipRead.Entries | Select-Object -ExpandProperty FullName
$zipRead.Dispose()
