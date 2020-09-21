#!/bin/sh

set -e

printf "\033[0;32mDeploying to GitHub...\033[0m\n"

npm run lint && npm run build

cd public
git add .
msg="publish $(date)"
if [ -n "$*" ]; then
	msg="$*"
fi
git commit -m "$msg"
git push origin gh-pages
