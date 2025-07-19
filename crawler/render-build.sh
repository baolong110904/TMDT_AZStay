#!/usr/bin/env bash
set -o errexit

echo "▶️ Running custom Render build..."

npm install

# Puppeteer caching
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then 
  echo "📁 Copying Puppeteer Cache from Build Cache" 
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR || echo "⚠️ No cache found"
else 
  echo "📁 Storing Puppeteer Cache in Build Cache" 
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME || echo "⚠️ Cache copy failed"
fi
