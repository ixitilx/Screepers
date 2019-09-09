cd /D "C:\Users\USER\AppData\Local\Screeps\scripts\127_0_0_1___21025"
rmdir /Q "default"
mkdir "default"
echo "Run screeps now"
pause

rmdir /Q "default"
mklink /D "default" "D:\Games\screeps\Screeps\src"
pause