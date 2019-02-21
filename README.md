# Google Assistant for Desktop

Google Assistant for Desktop is an cross-platform assistant powered by the Google Assistant SDK, it has support for the official HTML5 screen output.

![Screenshot of Google Assistant Desktop Client](/screenshots/screenshot-3.JPG?raw=true "Full html5 window preview")

## Features

* Google Assistant SDK v1alpha2
* 'Transparent' HTML5 screen output overlay
* Develop your own commands, trigger ```ask(question) // Promise``` or ```say(query)``` functions to let the assistant do whatever you want.
* Build in basic Spotify Web API support as a demo.

### Shortcut

Since hotword integration is not included yet, I've included a shortcut that triggers the assistant:

* Windows: Ctrl+Alt+A
* Mac OS: Control+Option+A

You'll hear a sound when you can start speaking almost instantly.

#### NOTE

This assistant desktop app is made for developers and hackers alike who like to play around with the SDK's and software. It will probably never be released as a stand-alone app that you can download since Google will probably never give us production API keys for a desktop client.

## TODO

* Update README configuration steps for key generation and creating basic commands yourself.

## Configuration

There's a couple of things that need to be done in order to run this application properly.

First of all you need your own Google Cloud account, since the Google Assistant SDK is still in alpha, google allows only 500 api calls everyday, the trial version will suffice since the Google Assistant SDK is still in alpha.

Follow the steps on this page;
https://developers.google.com/assistant/sdk/guides/library/python/embed/config-dev-project-and-account

After you've got your `client_secret_<client-id>.json` file rename it to `client_secret.json` and put it in the `src/renderer` folder.

## Build Setup

``` bash
# install dependencies
npm install # Install dev mode
npm start #
```

## Used Libraries / Boilerplates

* [Google Assistant (A node.js implementation of the Google Assistant SDK)](https://github.com/endoplasmic/google-assistant)
** Connection to the Google Assistant SDK Service
* [A Node.js wrapper for Spotify's Web API](https://github.com/thelinmichael/spotify-web-api-node)
** Used for integrating custom commands for Spotify
* [A voice control - voice commands - speech recognition and speech synthesis javascript library.](https://github.com/sdkcarlos/artyom.js)
** Used for text processing custom voice commands (The Google Assistant SDK does the actual transcription)

---
