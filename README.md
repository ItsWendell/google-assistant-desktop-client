# Google Assistant for Desktop

This is an Google Assistant desktop client build in electron, this application is still a w.i.p.

## Features
* Google Assistant SDK v1alpha2
* Custom Commands

## Custom Commands
We've implemented a way to deal with custom commands, we're using the Google Assistant SDK to recognize speech, once the speech is recongized and our 'command-engine' reconizes the command, we cancel the normal output and run the command.

* play * on youtube
* stop music, play music, stop the music, play the music.

## Configuration
There's a couple of things that need to be done in order to run this application properly.

First of all you need your own Google Cloud account, since the Google Assistant SDK is still in alpha, google allows only 500 api calls everyday, the trial version will suffice since the Google Assistant SDK is still in alpha.

Follow the steps on this page;
https://developers.google.com/assistant/sdk/guides/library/python/embed/config-dev-project-and-account

After you've got your client_secret_<client-id>.json file rename it to client_secret.json and put it in the src/renderer folder.

## Build Setup

``` bash
# install dependencies
npm install (--target=1.7.11 --runtime=electron)

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
# This is might not work properly yet for some platforms.
npm run build

# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).


python devicetool.py register --model 'ga-desktop-electron' \
                                            --type LIGHT --trait action.devices.traits.OnOff \
                                            --trait action.devices.traits.StartStop \
                                            --trait action.devices.traits.Toggles \
                                            --trait action.devices.traits.Modes \
                                            --manufacturer 'Wendell Misiedjan' \
                                            --product-name 'Google Assistant for Desktop' \
                                            --client-type SERVICE \
                                            --description 'Google Assistant for Desktop' \
                                            --device 'ga-desktop' \
                                            --nickname 'Google Aassistant for Desktop' \
