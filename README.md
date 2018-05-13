# Google Assistant for Desktop

This is a new version of the Google Assistant Desktop Client - this version is using the HTML5 screen output from the Google Assistant service.

![Screenshot of Google Assistant Desktop Client](/screenshots/screenshot-3.JPG?raw=true "Full html5 window preview")

This branch is still under development but wanted it to get it out there, it still needs a lot of refactoring and fixing compability with 'endoplasmic/google-assistant' node library since we switched in this version to this libary as a base for the assistant.

This application is still a w.i.p.

We've also updated Electron to version 2.0 and all other NPM packages to the newest version which grealy improved speed and stability overall.

## Features
* Google Assistant SDK v1alpha2
* 'Transparent' HTML5 screen output overlay
* Suggestions are clickable
* Screen auto-hides after x seconds depending on the output
* Seperate screen for text-input and voice trigger

## TODO
* Refactor custom command to 'endoplasmic/google-assistant'
* Only manual text input works for now, I need to fix the voice input for the new library.
* Fix Spotify Controls
* Look into 'Device Actions' for general custom commands
* Update README to include other packages used
* Update configuration notes

## Configuration
There's a couple of things that need to be done in order to run this application properly.

First of all you need your own Google Cloud account, since the Google Assistant SDK is still in alpha, google allows only 500 api calls everyday, the trial version will suffice since the Google Assistant SDK is still in alpha.

Follow the steps on this page;
https://developers.google.com/assistant/sdk/guides/library/python/embed/config-dev-project-and-account

After you've got your client_secret_<client-id>.json file rename it to client_secret.json and put it in the src/renderer folder.

## Build Setup

``` bash
# install dependencies
npm install (--target=2.0.0 --runtime=electron)

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
# This is might not work properly yet for some platforms.
npm run build

# lint all JS/Vue component files in `src/`
npm run lint

```

## Used Libraries / Boilerplates

* [Google Assistant (A node.js implementation of the Google Assistant SDK)](https://github.com/endoplasmic/google-assistant)

---
