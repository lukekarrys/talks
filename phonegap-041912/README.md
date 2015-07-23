# Presentation notes

## [Demo Source](https://github.com/lukekarrys/talks/blob/gh-pages/phonegap-041912/app/README.md)

### 0) Skipping ahead
- Download and install Xcode
- [Download PhoneGap](http://phonegap.com/download) and run the installer in the iOS directory

### 1) [Getting Started with iOS](http://docs.phonegap.com/en/1.6.1/guide_getting-started_ios_index.md.html#Getting%20Started%20with%20iOS)
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
- It's just CSS, JS, HTML!
- [Learn the API](http://docs.phonegap.com/en/1.6.1/index.html)

### 5) What next?
- Pick a different platform: [WP7](http://docs.phonegap.com/en/1.6.1/guide_getting-started_windows-phone_index.md.html#Getting%20Started%20with%20Windows%20Phone), [Android](http://docs.phonegap.com/en/1.6.1/guide_getting-started_android_index.md.html#Getting%20Started%20with%20Android), [others](http://docs.phonegap.com/en/1.6.1/guide_getting-started_ios_index.md.html#Getting%20Started%20with%20iOS)
- [Check out some "official" plugins](https://github.com/phonegap/phonegap-plugins)

*Note: to run on an iOS device you will need a developer license and a valid Bundle Identifier. See instructions on [Deploy to Device](http://docs.phonegap.com/en/1.6.1/guide_getting-started_ios_index.md.html#Getting%20Started%20with%20iOS_5b_deploy_to_device).*

#### References
- [http://www.dreamintech.net/2011/11/how-to-setup-and-use-nativecontrols-in-phonegap/](http://www.dreamintech.net/2011/11/how-to-setup-and-use-nativecontrols-in-phonegap/)
- [http://phonegap.com/](http://phonegap.com/)
