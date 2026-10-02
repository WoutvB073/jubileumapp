# Verkleint foto's voor de app.
#
# Gebruik: zet je foto's (JPG of PNG) in de map "foto-origineel" in de
# projectmap en dubbelklik op tools\verklein-fotos.cmd.
# Resultaat: verkleinde JPG's (max 1200 px breed) in de map "images".
#
# - Liggende/staande iPhone-foto's worden goed gedraaid.
# - Locatiegegevens (GPS) en andere metadata worden verwijderd.
# - Bestandsnamen worden kleine letters met streepjes: "Eerste Date.JPG" -> "eerste-date.jpg".
# - De map "foto-origineel" gaat niet mee naar GitHub (staat in .gitignore).

param(
  [int]$MaxBreedte = 1200,
  [int]$Kwaliteit = 82
)

Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $PSScriptRoot
$bron = Join-Path $project 'foto-origineel'
$doel = Join-Path $project 'images'

if (-not (Test-Path $bron)) {
  New-Item -ItemType Directory -Path $bron | Out-Null
  Write-Host ""
  Write-Host "  De map 'foto-origineel' is aangemaakt:"
  Write-Host "  $bron"
  Write-Host "  Zet daar je foto's in en start dit script opnieuw."
  Write-Host ""
  exit
}

$jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Kwaliteit)

$bestanden = Get-ChildItem -Path $bron -File
$aantal = 0

foreach ($bestand in $bestanden) {
  $ext = $bestand.Extension.ToLower()

  if ($ext -eq '.heic' -or $ext -eq '.heif') {
    Write-Host "  OVERGESLAGEN (HEIC): $($bestand.Name) - exporteer deze eerst als JPG."
    continue
  }
  if ($ext -notin @('.jpg', '.jpeg', '.png')) { continue }

  $naam = $bestand.BaseName.ToLower() -replace '[^a-z0-9]+', '-'
  $naam = $naam.Trim('-')
  if (-not $naam) { $naam = 'foto' }
  $uit = Join-Path $doel ($naam + '.jpg')

  $img = [System.Drawing.Image]::FromFile($bestand.FullName)
  try {
    # iPhone-foto's: draaiing staat in de metadata (EXIF-tag 0x0112).
    if ($img.PropertyIdList -contains 0x0112) {
      $stand = $img.GetPropertyItem(0x0112).Value[0]
      switch ($stand) {
        2 { $img.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        4 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
        5 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        7 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    }

    $breedte = [Math]::Min($MaxBreedte, $img.Width)
    $hoogte = [int][Math]::Round($img.Height * $breedte / $img.Width)

    # Nieuw, schoon plaatje tekenen (zonder metadata), witte achtergrond voor PNG's met transparantie.
    $nieuw = New-Object System.Drawing.Bitmap($breedte, $hoogte)
    $g = [System.Drawing.Graphics]::FromImage($nieuw)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $breedte, $hoogte)
    $g.Dispose()

    $nieuw.Save($uit, $jpgCodec, $params)
    $nieuw.Dispose()

    $kb = [int]((Get-Item $uit).Length / 1024)
    Write-Host ("  OK  {0}  ->  images/{1}.jpg  ({2}x{3}, {4} KB)" -f $bestand.Name, $naam, $breedte, $hoogte, $kb)
    $aantal++
  } finally {
    $img.Dispose()
  }
}

Write-Host ""
Write-Host "  Klaar: $aantal foto('s) in de map images."
Write-Host "  Gebruik ze in content.js als 'images/<naam>.jpg'."
Write-Host ""
