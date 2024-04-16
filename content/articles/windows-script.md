---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-07-28T00:00:00.000Z
update: 2023-10-23T00:00:00.000Z
---

# Windows 常用脚本

## 清除图标缓存

```cmd
taskkill /f /im explorer.exe

cd /d %userprofile%\AppData\Local\Microsoft\Windows\Explorer

attrib -h iconcache_*.db

del iconcache_*.db /a

CD /d %userprofile%\AppData\Local

DEL IconCache.db /a

start explorer

start explorer.exe

cho 执行完成
```

## 安装开启组策略

```cmd
@echo off
pushd "%~dp0"
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~3*.mum >List.txt
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~3*.mum >>List.txt
for /f %%i in ('findstr /i . List.txt 2^>nul') do dism /online /norestart /add-package:"C:\Windows\servicing\Packages\%%i"
pause
```

## 安装开启 hyper-v

```cmd
pushd "%~dp0"
dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt
for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
del hyper-v.txt
Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
```

## 重新编译 .net framework 机器码

```powershell
$env:PATH = [Runtime.InteropServices.RuntimeEnvironment]::GetRuntimeDirectory()
[AppDomain]::CurrentDomain.GetAssemblies() | ForEach-Object {
    $path = $_.Location
    if ($path) {
        $name = Split-Path $path -Leaf
        Write-Host -ForegroundColor Yellow "`r`n$name"
        ngen.exe install $path /nologo
    }
}
```

## powershell 配置

```powershell
$Env:POWERSHELL_UPDATECHECK="LTS"

$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding

Import-Module PSReadLine
Set-PSReadLineOption -Colors @{
    Command                = [ConsoleColor]::Blue
    Comment                = [ConsoleColor]::DarkGray
    ContinuationPrompt     = [ConsoleColor]::White
    Default                = [ConsoleColor]::White
    Emphasis               = [ConsoleColor]::Cyan
    Error                  = [ConsoleColor]::Red
    InlinePrediction       = [ConsoleColor]::DarkGray
    Keyword                = [ConsoleColor]::DarkBlue
    ListPrediction         = [ConsoleColor]::DarkGray
    ListPredictionSelected = "$([char]0x1b)[30;47m"
    Member                 = [ConsoleColor]::Magenta
    Number                 = [ConsoleColor]::Blue
    Operator               = [ConsoleColor]::White
    Parameter              = [ConsoleColor]::White
    String                 = [ConsoleColor]::DarkGreen
    'Type'                 = [ConsoleColor]::Green
    Variable               = [ConsoleColor]::Yellow
}
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
Set-PSReadLineKeyHandler -Key "Tab" -Function MenuComplete
Set-PSReadlineKeyHandler -Key "Ctrl+d" -Function ViExit
Set-PSReadLineKeyHandler -Key "Ctrl+z" -Function Undo
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward

function ListDirectory {
    (Get-ChildItem).Name
    Write-Host("")
}
Set-Alias -Name ls -Value ListDirectory -Option AllScope
Set-Alias -Name ll -Value Get-ChildItem -Option AllScope

function OpenCurrentFolder {
    param
    (
        $Path = '.'
    )
    Invoke-Item $Path
}
Set-Alias -Name open -Value OpenCurrentFolder -Option AllScope

Set-Alias -Name pn -Value pnpm -Option AllScope

Invoke-Expression (&starship init powershell)

```
