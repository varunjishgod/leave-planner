#!/bin/sh
# deploy to github pages (npm run deploy)
set -e
npm run build
cd dist
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy site"
git push -q -f https://github.com/varunjishgod/leave-planner.git gh-pages
rm -rf .git
echo "Deployed. Live in about a minute at https://varunjishgod.github.io/leave-planner/"
