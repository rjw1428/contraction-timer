# Contraction Timer
A simple &amp; free contraction timer for tracking the duration and frequency of contractions during pregnancy labor.


## Working with Cordova
I have not created any automation to convert the build from a web build to the cordova build.
This involves taking the vite `/dist`, copying the css & js to their respective folders in `cordova/www`
and updating the `cordova/www/index.html` to point to the correct files.

To Run:
npm run start:ios

To Build:
npm run build:ios