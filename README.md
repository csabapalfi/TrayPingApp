# TrayPing.app

Simple OSX tray application displaying google.com ping times (refreshed every 2 secs)

![screenshot](screenshot.png)

## Installation

* download [latest release](https://github.com/csabapalfi/tray-ping/releases/latest)
* unzip and drag TrayPing.app to Applications.

## Why?

* This app helps by displaying actual network status at a glance
* I keep ending up using unreliable WiFi networks.
* Even if I'm connected ping times spike periodically.
* Or request starts timing out all without loosing actual WiFi connection.

## What's missing?

* any sort of configurability (host, ping interval, timeout)
* use .dmg and add /Applications shortcut for easier install

## Development

Requires [CocoaPods](https://cocoapods.org/)

```
pod install
open TrayPing.xcworkspace
```
