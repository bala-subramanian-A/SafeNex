$port = 8085
$distFolder = Join-Path $PSScriptRoot "dist"
$folder = if (Test-Path (Join-Path $distFolder "index.html")) { $distFolder } else { $PSScriptRoot }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

$listener.Start()
Write-Host "SAFENEX Web Server running at http://localhost:$port/"
Write-Host "Serving static files from: $folder"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/" -or [string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "/index.html"
        }

        $filePath = Join-Path $folder ($localPath.TrimStart('/').Replace('/', '\'))

        # Fallback to index.html for SPA client-side routes if file doesn't exist
        if (-not (Test-Path -Path $filePath -PathType Leaf)) {
            $fallback = Join-Path $folder "index.html"
            if (Test-Path -Path $fallback -PathType Leaf) {
                $filePath = $fallback
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".webmanifest" { "application/manifest+json; charset=utf-8" }
                ".png"  { "image/png" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                ".mp4"  { "video/mp4" }
                ".m4a"  { "audio/mp4" }
                Default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $err.Length
            $response.OutputStream.Write($err, 0, $err.Length)
        }
        $response.OutputStream.Close()
    } catch {}
}
