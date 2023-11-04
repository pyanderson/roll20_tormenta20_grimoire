#!/usr/bin/env bash

set -e

mkdir -p releases/

version=$(grep -o '"version": *"[^"]*"' "manifest.v3.json" | sed 's/"version": "\(.*\)"/\1/')

manifests=("v2" "v3")

cp package.json package-lock.json webpack.config.cjs manifest.v3.json dist/
cp BUILD.md dist/README.md

for manifest in "${manifests[@]}"; do
  echo "preparing version $version for $manifest"
  cp "manifest.$manifest.json" "dist/manifest.json"
  [ -e "releases/$manifest-$version.zip" ] && rm "releases/$manifest-$version.zip"
  cd dist && zip -r "../releases/$manifest-$version.zip" * && cd ..
  echo "$manifest-$version done"
done
