$teamDir = 'c:\Users\PC\Downloads\projects\mktimothynew\app\(newpage)\team'
$dirs = Get-ChildItem -Path $teamDir -Directory | Where-Object { $_ -match '-' }

$teamPage = Join-Path $teamDir 'page.tsx'
$teamContent = Get-Content $teamPage -Raw

foreach ($dir in $dirs) {
    $oldName = $dir.Name
    $firstName = $oldName.Split('-')[0]
    $capitalized = $firstName.Substring(0,1).ToUpper() + $firstName.Substring(1).ToLower()

    $pageFile = Join-Path $dir.FullName 'page.tsx'
    if (Test-Path $pageFile) {
        $content = Get-Content $pageFile -Raw
        $content = $content -replace '(?m)^(\s*description:\s*")[^"]+(".*)$', "${1}${2}"
        Set-Content -Path $pageFile -Value $content
    }
    
    Rename-Item -Path $dir.FullName -NewName $firstName
    
    $teamContent = $teamContent -replace "/team/$oldName", "/team/$firstName"
}

Set-Content -Path $teamPage -Value $teamContent
Write-Host 'Done!'
