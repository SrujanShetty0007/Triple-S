@echo off
echo Running Triple S Website Update Script
echo =====================================

echo Updating main PDF manifest...
node update_manifest.js

echo.
echo Updating 2025 Scheme manifest...
node update_manifest_2025.js

echo.
echo Update complete! You can now commit and push your changes.
echo.

pause