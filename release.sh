#!/usr/bin/env bash

set -e

mkdir -p releases/

version=$(grep -o '"version": *"[^"]*"' "chrome/manifest.json" | sed 's/"version": "\(.*\)"/\1/')

browsers=("firefox" "chrome")

for browser in "${browsers[@]}"; do
    echo "preparing version $version for $browser"
    cp "$browser/manifest.json" "src/manifest.json"
    [ -e "releases/$browser-$version.zip" ] && rm "releases/$browser-$version.zip"
    cd src && zip -r "../releases/$browser-$version.zip" * && cd ..
    echo "$browser-$version done"
done
