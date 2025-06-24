@echo off
echo Running Triple S Website Update Script
echo =====================================

echo Updating PDF manifest...
node update_manifest.js

echo.
echo Update complete! You can now commit and push your changes.
echo.

pause 