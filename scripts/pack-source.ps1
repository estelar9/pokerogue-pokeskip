Add-Type -AssemblyName System.IO.Compression.FileSystem

$baseDir = Split-Path -Parent $PSScriptRoot
$zipPath = Join-Path $baseDir "source-code.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$rootFiles = @(
    "package.json",
    "package-lock.json",
    "build.js",
    "README.md",
    "CHANGELOG.md",
    "LICENSE"
)

foreach ($file in $rootFiles) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        Write-Host "Adding $file"
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $file)
    }
}

$dirs = @("src", "extension")
foreach ($dir in $dirs) {
    $dirPath = Join-Path $baseDir $dir
    if (Test-Path $dirPath) {
        $items = Get-ChildItem -Path $dirPath -Recurse -File
        foreach ($item in $items) {
            $relPath = $item.FullName.Substring($baseDir.Length + 1)
            $entryName = $relPath.Replace("\", "/")
            Write-Host "Adding $entryName"
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $item.FullName, $entryName)
        }
    }
}

$zip.Dispose()
Write-Host "`nSuccessfully created $zipPath"

$zipRead = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "`nListing entries in zip:"
$zipRead.Entries | Select-Object -ExpandProperty FullName
$zipRead.Dispose()
