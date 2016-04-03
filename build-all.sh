#!/usr/bin/env bash

if [ -d dist ]; then
    rm -rf dist
fi

npm run dist
mv dist tmp
mkdir dist

mv tmp/Chad-darwin-x64/Chad-*.dmg tmp/win/ChadSetup*.exe tmp/win-x64/ChadSetup*.exe dist/
rm -rf tmp