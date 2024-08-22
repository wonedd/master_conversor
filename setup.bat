@echo off
setlocal

:: Variáveis de caminho
set NODE_URL=https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
set FFMPG_URL=https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
set PYTHON_URL=https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe

:: Diretório de instalação
set INSTALL_DIR=%~dp0tools
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Instalar Node.js
echo Instalando Node.js...
curl -L %NODE_URL% -o "%INSTALL_DIR%\nodejs.msi"
start /wait msiexec /i "%INSTALL_DIR%\nodejs.msi" /quiet /norestart

:: Instalar FFmpeg
echo Instalando FFmpeg...
curl -L %FFMPG_URL% -o "%INSTALL_DIR%\ffmpeg.zip"
powershell -Command "Expand-Archive -Path '%INSTALL_DIR%\ffmpeg.zip' -DestinationPath '%INSTALL_DIR%'"
set FFMPG_DIR=%INSTALL_DIR%\ffmpeg-release-essentials\bin
setx PATH "%PATH%;%FFMPG_DIR%"
echo FFmpeg instalado com sucesso.

:: Instalar Python
echo Instalando Python...
curl -L %PYTHON_URL% -o "%INSTALL_DIR%\python.exe"
start /wait "%INSTALL_DIR%\python.exe" /quiet InstallAllUsers=1 PrependPath=1

:: Instalar spotdl via pip
echo Instalando spotdl...
python -m pip install --upgrade pip
python -m pip install spotdl

:: Instalar dependências do Node.js
echo Instalando dependências do Node.js...
cd /d "%~dp0"
if exist package.json (
    npm install
) else (
    echo Não há um package.json para instalar dependências.
)

:: Adicionar variáveis de ambiente ao PATH
echo Adicionando variáveis de ambiente...
set PYTHON_DIR=C:\Program Files\Python312
set SCRIPT_DIR=%~dp0
setx PATH "%PATH%;%FFMPG_DIR%;%PYTHON_DIR%;%PYTHON_DIR%\Scripts;%SCRIPT_DIR%"

:: Criar o script run.bat
echo Criando o script run.bat...
echo @echo off > "%~dp0\run.bat"
echo cd /d "%~dp0" >> "%~dp0\run.bat"
echo echo Welcome! You are now free from all those crappy websites. >> "%~dp0\run.bat"
echo echo. >> "%~dp0\run.bat"
echo echo. >> "%~dp0\run.bat"
echo echo. >> "%~dp0\run.bat"
echo color 0A >> "%~dp0\run.bat"
echo echo Please enter the URLs separated by spaces: >> "%~dp0\run.bat"
echo set /p "urls=" >> "%~dp0\run.bat"
echo color 07 >> "%~dp0\run.bat"
echo echo. >> "%~dp0\run.bat"
echo echo. >> "%~dp0\run.bat"
echo echo Running command: node c.js %%urls%% >> "%~dp0\run.bat"
echo node c.js %%urls%% >> "%~dp0\run.bat"

:: Adicionar o diretório do script ao PATH do sistema
echo Adicionando o diretório do script ao PATH...
setx PATH "%PATH%;%~dp0"

echo Instalação concluída. Feche e reabra o prompt de comando para que as alterações no PATH tenham efeito.
pause
