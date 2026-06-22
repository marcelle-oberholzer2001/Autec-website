param()

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$productsFolder = Join-Path $root 'assets\products'
$productsPage = Join-Path $root 'products.html'
$extensions = @('.jpg', '.jpeg', '.png', '.webp', '.gif')
$products = @(
    @{ Slug = 'cil-containerized-plant'; Page = 'product-4500-tpm-cil-containerized-plant.html'; Name = '4500 tpm CIL Containerized Plant' },
    @{ Slug = 'concentrators'; Page = 'product-concentrators.html'; Name = 'Concentrators' },
    @{ Slug = 'carbon-pumps'; Page = 'product-carbon-pumps.html'; Name = 'Carbon Pumps' },
    @{ Slug = 'slurry-pumps'; Page = 'product-slurry-pumps.html'; Name = 'Slurry Pumps' },
    @{ Slug = 'pin-mill'; Page = 'product-pin-mill.html'; Name = 'Pin Mill' },
    @{ Slug = 'mixers'; Page = 'product-mixers.html'; Name = 'Mixers' },
    @{ Slug = 'hammer-mill'; Page = 'product-hammer-mill.html'; Name = 'Hammer Mill' },
    @{ Slug = 'bulldog'; Page = 'product-bulldog.html'; Name = 'Bulldog' }
)

[System.IO.Directory]::CreateDirectory($productsFolder) | Out-Null
$catalogHtml = [System.IO.File]::ReadAllText($productsPage)
$updatedProducts = 0

foreach ($product in $products) {
    $folder = Join-Path $productsFolder $product.Slug
    [System.IO.Directory]::CreateDirectory($folder) | Out-Null
    $images = Get-ChildItem -Path $folder -File |
        Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
        Sort-Object Name

    if (-not $images.Count) { continue }

    $urls = $images | ForEach-Object { "assets/products/$($product.Slug)/$($_.Name)" }
    $heroUrl = [System.Security.SecurityElement]::Escape($urls[0])
    $cardAlt = [System.Security.SecurityElement]::Escape($product.Name)
    $cardPattern = '(<article class="product-card reveal" data-product-card="' + [regex]::Escape($product.Slug) + '">\s*)<img\b[^>]*>'
    $catalogHtml = [regex]::Replace($catalogHtml, $cardPattern, ('$1<img src="' + $heroUrl + '" alt="' + $cardAlt + '" />'), 'Singleline')

    $pagePath = Join-Path $root $product.Page
    $pageHtml = [System.IO.File]::ReadAllText($pagePath)
    $heroPattern = '(<section class="hero inner-hero" style="background-image:url\('')[^'']+(''\)")'
    $pageHtml = [regex]::Replace($pageHtml, $heroPattern, ('$1' + $heroUrl + '$2'), 'Singleline')

    $photoTags = foreach ($url in $urls) {
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($url) -replace '[-_]+', ' '
        $alt = [System.Security.SecurityElement]::Escape("$($product.Name): $fileName")
        '<img src="' + [System.Security.SecurityElement]::Escape($url) + '" alt="' + $alt + '">'
    }
    $photosPattern = '(<aside class="product-photos">).*?(</aside>)'
    $pageHtml = [regex]::Replace($pageHtml, $photosPattern, ('$1' + ($photoTags -join '') + '$2'), 'Singleline')
    [System.IO.File]::WriteAllText($pagePath, $pageHtml)
    $updatedProducts++
}

[System.IO.File]::WriteAllText($productsPage, $catalogHtml)
Write-Host "Updated product images for $updatedProducts product(s)."
