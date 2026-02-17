Add-Type -AssemblyName System.Drawing
$files = @(
    "c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\assets\images\lotus_bud.png",
    "c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\assets\images\lotus_bloom.png"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Converting $file..."
        try {
            $img = [System.Drawing.Image]::FromFile($file)
            $tempFile = $file + ".tmp.png"
            $img.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
            $img.Dispose()
            
            # Ensure the handle is released
            Start-Sleep -Milliseconds 200
            
            Move-Item -Force $tempFile $file
            Write-Host "Success: Converted $file to PNG"
        }
        catch {
            Write-Host "Error converting $file : $_"
        }
    }
    else {
        Write-Host "File not found: $file"
    }
}
