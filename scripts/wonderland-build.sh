#!/bin/sh

set -e

source="$1"
directory=$(dirname $1)
echo "Loading & packaging project $source:"
WonderlandEditor --windowless --package --project "$1"

# Copy deploy folder in static

mkdir -p static/demo

folder=`basename $directory`
dest="static/demo/$folder"
rm -rf "$dest"
cp -rf "$directory/deploy" "$dest"
echo "Copied deploy folder from $directory into $dest"

# Cleanup deploy
rm -f $dest/*.js.map
