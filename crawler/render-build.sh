#!/bin/bash
echo "Installing dependencies..."
yarn install

echo "Building TypeScript..."
yarn run build

echo "Build completed!"