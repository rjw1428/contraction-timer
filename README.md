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

cordova build ios --device --release --codeSignIdentity="iPhone Distribution" --provisioningProfile="4f1d6ec8-0ec1-4eaa-817e-592773a41017" --developmentTeam="5ZQD5L6PNN" --packageType="app-store-connect"

cordova build android --release