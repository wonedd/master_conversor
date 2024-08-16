@echo off
:: Mude para o diretório onde o script .bat está localizado
cd /d "%~dp0"

:: Mude para o diretório do projeto (uma pasta acima do script .bat)
cd ..

:: Mensagem de boas-vindas
echo Welcome! You are now free from all those crappy websites.

:: Adicione espaço adicional
echo.
echo.
echo.

:: Defina a cor do texto para verde
color 0A

:: Solicite a entrada do usuário
echo Please enter the URLs separated by spaces:
set /p "urls="

:: Restaure a cor padrão
color 07

:: Adicione mais espaço antes de executar o comando
echo.
echo.

:: Execute o comando Node.js com as URLs fornecidas
echo Running command: node c.js %urls%
node c.js %urls%

:: Pausa para o usuário ver os resultados
pause
