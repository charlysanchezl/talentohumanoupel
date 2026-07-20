$git = "C:\Program Files\Git\cmd\git.exe"
& $git init
& $git config user.name "UPEL Admin"
& $git config user.email "admin@upel.edu"
& $git add .
& $git commit -m "Initial commit"
& $git branch -M main
& $git remote add origin https://github.com/xvyerika/talentohumanoupel.git
& $git push -u origin main
