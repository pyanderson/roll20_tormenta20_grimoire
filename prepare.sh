#!/usr/bin/env bash

set -e

if [[ "$1" =~ ^(chrome|firefox)$ ]]; then
    echo "preparing $1"
    cp "$1"/manifest.json src/manifest.json
    [ -e better-t20-"$1".zip ] && rm better-t20-"$1".zip
    cd src && zip -r ../better-t20-"$1".zip * && cd ..
    echo "$1 done"
else
    echo "invalid option: $1"
fi