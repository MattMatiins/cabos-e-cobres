@echo off
chcp 65001 >nul 2>&1
title Cabos e Cobres - Setup
color 0E

echo ============================================
echo    CABOS E COBRES - Setup Automatico
echo ============================================
echo.
echo Pasta atual: %CD%
echo.

:: Verificar package.json
if not exist "package.json" (
    echo [ERRO] package.json nao encontrado nesta pasta!
    echo.
    echo Verifique se os arquivos foram extraidos aqui.
    echo O package.json precisa estar em: %CD%\package.json
    echo.
    echo Arquivos nesta pasta:
    dir /b
    echo.
    goto :FIM
)

echo [OK] package.json encontrado!
echo.

:: Verificar Node
echo [1/5] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js NAO instalado!
    echo Baixe em: https://nodejs.org
    goto :FIM
)
node -v
echo.

:: Verificar npm
echo [2/5] Verificando npm...
npm -v
echo.

:: Instalar dependencias
echo [3/5] Instalando dependencias...
echo Isso pode levar 1-3 minutos, aguarde...
echo.

if exist "node_modules" (
    echo Removendo node_modules antigo...
    rmdir /s /q node_modules >nul 2>&1
)
if exist "package-lock.json" (
    del package-lock.json >nul 2>&1
)

call npm install 2>&1

echo.
if not exist "node_modules" (
    echo [ERRO] Instalacao falhou!
    echo.
    echo Tente rodar manualmente:
    echo   cd %CD%
    echo   npm install
    goto :FIM
)

echo [OK] Dependencias instaladas!
echo.

:: Criar .env.local
echo [4/5] Criando .env.local...
if not exist ".env.local" (
    (
        echo STRIPE_SECRET_KEY=sk_test_COLE_SUA_CHAVE_AQUI
        echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_COLE_SUA_CHAVE_AQUI
    ) > .env.local
    echo [OK] .env.local criado!
) else (
    echo [OK] .env.local ja existe.
)
echo.

:: Git
echo [5/5] Inicializando Git...
where git >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Git nao instalado, pulando.
) else (
    if not exist ".git" (
        git init
        git add .
        git commit -m "feat: setup inicial Cabos e Cobres"
        echo [OK] Git pronto!
    ) else (
        echo [OK] Git ja inicializado.
    )
)

echo.
echo ============================================
echo    TUDO PRONTO!
echo ============================================
echo.
echo  1. Edite .env.local com chaves do Stripe
echo  2. Rode: npm run dev
echo  3. Acesse: http://localhost:3000
echo.
echo ============================================
echo.

set /p RODAR="Rodar o servidor agora? (S/N): "
if /i "%RODAR%"=="S" (
    echo.
    echo Abrindo http://localhost:3000 ...
    echo Para parar: CTRL+C
    echo.
    start http://localhost:3000
    timeout /t 3 /nobreak >nul
    call npm run dev
)

:FIM
echo.
pause
