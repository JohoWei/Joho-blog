#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 执行sh deploy.sh

git init
git add .
git commit -m "deploy"
git branch -M master
git remote add origin git@github.com:JohoWei/Joho-blog.git
git pull --rebase origin master 
git push -u origin master

cd -