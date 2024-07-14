@echo off
REM Define a página de código para UTF-8
chcp 65001 >nul

REM Verifica se o Node.js está instalado
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js nao está instalado. Por favor, instale-o em https://nodejs.org/
    pause
    exit /b
)

REM Verifica se as dependências estão instaladas
IF NOT EXIST "node_modules" (
    echo Instalando dependencias do npm...
    call npm install
    IF %ERRORLEVEL% NEQ 0 (
        echo Falha ao instalar dependencias. Verifique os erros acima.
        pause
        exit /b
    )
)

REM Executa o script Node.js
echo Executando script...
call node index.js
IF %ERRORLEVEL% NEQ 0 (
    echo Falha ao executar o script. Verifique os erros acima.
    pause
    exit /b
)

REM Pausa para ver o resultado antes de fechar a janela
pause
