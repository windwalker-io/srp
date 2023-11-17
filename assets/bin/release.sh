yarn build:prod
V=$(npm version "${1:-patch}" --no-git-tag-version)
git add .
git commit -am "NPM release ${V}"
npm publish
