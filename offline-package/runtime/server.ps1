$port = 8765
$root = Join-Path $PSScriptRoot "..\dist"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "神枢数字展厅服务器已启动: http://127.0.0.1:$port"
Write-Host "按 Ctrl+C 关闭服务器"

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        $path = $req.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        $file = Join-Path $root $path
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $mime = switch ($ext) {
            ".html" { "text/html" }
            ".js"   { "application/javascript" }
            ".css"  { "text/css" }
            ".json" { "application/json" }
            ".png"  { "image/png" }
            ".jpg"  { "image/jpeg" }
            ".jpeg" { "image/jpeg" }
            ".gif"  { "image/gif" }
            ".svg"  { "image/svg+xml" }
            ".ico"  { "image/x-icon" }
            ".woff" { "font/woff" }
            ".woff2"{ "font/woff2" }
            ".ttf"  { "font/ttf" }
            ".mp4"  { "video/mp4" }
            ".webm" { "video/webm" }
            ".glb"  { "model/gltf-binary" }
            default { "application/octet-stream" }
        }
        if (Test-Path $file -PathType Leaf) {
            $data = [System.IO.File]::ReadAllBytes($file)
            $res.ContentType = $mime
            $res.OutputStream.Write($data, 0, $data.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    }
} finally {
    $listener.Stop()
}
