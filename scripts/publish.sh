#!/bin/sh

set -e

printf "\033[0;32mDeploying to GitHub...\033[0m\n"

npm run clean

git branch -D gh-pages
git checkout -b gh-pages

npm run lint && npm run build

git add -f docs
msg="publish $(date)"
if [ -n "$*" ]; then
	msg="$*"
fi
git commit -m "$msg"

git push origin gh-pages -f
