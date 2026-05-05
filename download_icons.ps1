$icons = @{
    "arrow_forward" = "arrow-right";
    "info" = "info";
    "check_circle" = "circle-check";
    "edit_document" = "file-pen-line";
    "swap_horiz" = "arrow-left-right";
    "add" = "plus";
    "group" = "users";
    "account_tree" = "network";
    "schema" = "layers";
    "sync" = "refresh-cw";
    "upload_file" = "file-up";
    "group_add" = "user-plus";
    "verified" = "badge-check";
    "star_half" = "star-half";
    "warning" = "triangle-alert";
    "file_download" = "file-down";
    "person" = "user";
    "supervisor_account" = "user-cog";
    "admin_panel_settings" = "shield-check"
}

$destDir = "e:\GitHub\PulsePerform\src\web\public\assets\icons"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

foreach ($key in $icons.Keys) {
    $lucideName = $icons[$key]
    $url = "https://unpkg.com/lucide-static@0.368.0/icons/$lucideName.svg"
    $dest = Join-Path $destDir "$key.svg"
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    } catch {
        Write-Host "Failed to download $key from $url"
    }
}
Write-Host "Done downloading icons."
