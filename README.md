# Firework Simulator

Live site: https://fireworks.xpy.me/

A lightweight, no-build fireworks simulator built with Canvas and WebAudio. It runs as plain static files and uses ES modules.

## Run locally

- Open index.html in a local server (recommended) or directly in a browser.
- For a simple local server:
  - Python: python3 -m http.server 8080
  - Node: npx serve

## Structure

- index.html: App entry
- css/: Styles
- js/app/: App modules
- js/Stage.js: Canvas stage + ticker
- js/MyMath.js: Math helpers
- js/fscreen.js: Fullscreen helper

## Notes

- Add ?debug=1 to the URL for the FPS/particle overlay.
