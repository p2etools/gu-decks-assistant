## Introduction

This is your Gods Unchained Assistant and still under development.

### Warning

Due this is a young and free software and it may not work in your computer

See: https://stackoverflow.com/questions/63470436/what-is-the-best-way-to-publish-an-electron-application-in-order-to-avoid-window

I never faced this problem in my computer that always turn off Windows Smartscreen and Windows Defender

(Sorry Microsoft but I do not like those two softwares :) )

![GuDeck Assistant](https://i.imgur.com/UUZ8T9d.png)

## Features (need helps):
Priority highest to lowest

- [x] Get Player Decks
- [x] Get Opponent Decks
- [x] Implement CI/CD for testing/release prebuilt app for new versions (for new users)
- [x] Implement update app functions (for existing users)
- [ ] Need some helps from UI expert to make the app looks like a killer app ;)
- [ ] Show remaining cards for both player (by remaining cards, it means those cards do not enter the boards)
- [ ] Show icon for each items (can get from API or using local images) and description for each item (hover to see its)
- [ ] Get win rate overall for both player (can be done easily using Gods Unchained API)
- [ ] Handle error when sometimes the decks did not load successfully (due to API problems)
- [ ] Center event/crash logging
- [ ] Handle new users (see file data.txt), due to cost problem thus I am not using database at the moment
- [ ] Supported MacOS (I do not have a lot of time this moment)
- [ ] For some cards like `Deuteria, Manashard Mage` it will add another cards to player's deck

## How to install the app:
- Make sure you are using Windows, version 10 will be better, not sure for another versions
- Go to the [release page](https://github.com/p2etools/gu-decks-assistant/releases), download and install the latest build (.exe)
- The app is using auto updater so you will always have the latest update

## Demo videos:
- Install the app (click to play):

[![1. Install GU Decks Assistant](https://i.ytimg.com/vi/7wn940rGdjc/0.jpg)](https://youtu.be/7wn940rGdjc)


- A sample game with the app (click to play):

[![1. Install GU Decks Assistant](https://i.ytimg.com/vi/eSqllxM2Nu8/0.jpg)](https://youtu.be/eSqllxM2Nu8)

## Technologies:
- Electron
- GuDecks and Gods Unchained API
- Handle realtime communication between render and main process
- <del>Handle reading and parse large log files</del>
- Jquery (not so crazy or scary)
- I wish I could add more :)

## Alternative:
- GU Deck trackers:
https://github.com/JMoore11235/GU_Deck_Tracker

## Disclaimers:
For GuDecks and Gods Unchained:
- This app is using GuDecsk and Gods Unchained API, thank you for make awesome products.

  Please do not worry, I do not want to abuse your API, have save user data to a file named `data.json` and also implement caching so the app wont call your API too much, I promise

- By the way, if it violates anything under your policies please do not hesitate to open issues at the repository

For players:
- It cannot ensure your wins so please use it at your own risk
- The app does not collect or process any your data

For contributors:
- If you have any ideas for the app, please drop your messages :)