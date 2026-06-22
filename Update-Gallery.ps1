param()

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$assets = Join-Path $root 'assets'
$galleryFolder = Join-Path $assets 'gallery'
$galleryPage = Join-Path $root 'gallery.html'
$extensions = @('.jpg', '.jpeg', '.png', '.webp', '.gif')

[System.IO.Directory]::CreateDirectory($galleryFolder) | Out-Null

$legacyImages = Get-ChildItem -Path $assets -File -Filter 'gallery-*' |
    Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
    ForEach-Object { [PSCustomObject]@{ File = $_; Url = "assets/$($_.Name)" } }

$newImages = Get-ChildItem -Path $galleryFolder -File |
    Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object Name |
    ForEach-Object { [PSCustomObject]@{ File = $_; Url = "assets/gallery/$($_.Name)" } }

$images = @($legacyImages) + @($newImages)
if (-not $images.Count) {
    throw 'No gallery images were found.'
}

$items = foreach ($image in $images) {
    $description = [System.IO.Path]::GetFileNameWithoutExtension($image.File.Name) -replace '[-_]+', ' '
    $description = ($description -replace '\s+', ' ').Trim()
    $alt = "SA Autec Industries gallery image: $description"
    $escapedUrl = [System.Security.SecurityElement]::Escape($image.Url)
    $escapedAlt = [System.Security.SecurityElement]::Escape($alt)
    "<img src=`"$escapedUrl`" alt=`"$escapedAlt`" class=`"gallery-item reveal`">"
}

$html = [System.IO.File]::ReadAllText($galleryPage)
$start = '<!-- GALLERY:START -->'
$end = '<!-- GALLERY:END -->'
$startIndex = $html.IndexOf($start)
$endIndex = $html.IndexOf($end)
if ($startIndex -lt 0 -or $endIndex -lt 0 -or $endIndex -le $startIndex) {
    throw 'Gallery markers were not found in gallery.html.'
}

$replacement = "$start`r`n$($items -join "`r`n")`r`n$end"
$updatedHtml = $html.Substring(0, $startIndex) + $replacement + $html.Substring($endIndex + $end.Length)
[System.IO.File]::WriteAllText($galleryPage, $updatedHtml)

Write-Host "Gallery updated with $($images.Count) images."
