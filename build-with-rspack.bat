@echo off
set MODERN_JS_BUNDLER=experimental-rspack
pnpm build
exit /b %ERRORLEVEL%