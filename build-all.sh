#!/bin/bash

# Exit on error
set -e

# Build the Vite application
_VITE_BUILD_COMMAND="npm run build:mobile"
echo "Running: $_VITE_BUILD_COMMAND"
$_VITE_BUILD_COMMAND

# Copy the build output to the Cordova www directory
_CORDOVA_WWW_DIR="cordova/www"
_VITE_DIST_DIR="dist"
echo "Copying '$_VITE_DIST_DIR' to '$_CORDOVA_WWW_DIR'"
rm -rf "$_CORDOVA_WWW_DIR"/*
cp -R "$_VITE_DIST_DIR"/* "$_CORDOVA_WWW_DIR"/

# Navigate to the Cordova directory
cd cordova

# Build the Android and iOS release versions
_ANDROID_BUILD_COMMAND="cordova build android --release"
_IOS_BUILD_COMMAND="cordova build ios --release"

echo "Running: $_ANDROID_BUILD_COMMAND"
$_ANDROID_BUILD_COMMAND

echo "Running: $_IOS_BUILD_COMMAND"
$_IOS_BUILD_COMMAND

echo "Build process complete."
