# Some notes (let's live code this)

## Hope I don't crash and burn.

### 0) Skipping ahead
- Download and install Xcode
- [Download PhoneGap](http://phonegap.com/download-thankyou) and run the installer in the iOS directory

### 1) [Getting Started](http://phonegap.com/start)
- Make a new Cordova based application in Xcode
- Add Product Name and Identifier
- Don't check 'Automatic Reference Counting'
- Choose a directory and Source Control it

### 2) ZOMG! It's an APP!!!
- Set desired options in 'Summary' tab
- Open project in Finder and drag 'www' dir onto app name in Xcode
- Check 'copy items...' and 'Create folder refs'
- Run with iPhone simulator

### 3) Adding a plugin
- `git clone https://github.com/phonegap/phonegap-plugins`
- drag iOS/NativeControls/NativeControls.[hm] onto Plugins dir in Xcode
- add iOS/NativeControls/NativeControls.js to www dir

### 4) Just add JS Codez
