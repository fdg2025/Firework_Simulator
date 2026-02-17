# Firework Simulator

Live site: https://fireworks.xpy.me/

A lightweight, no-build fireworks simulator built with Canvas and WebAudio. It runs as plain static files and uses ES modules.

## Features

- 🎆 Realistic particle physics and animations
- 🎨 Multiple shell types and color palettes
- 🔊 WebAudio sound effects
- 📱 Mobile and desktop support
- ⚡ High-performance canvas rendering
- 🎮 Interactive controls and auto-launch mode

### Available Firework Types

**Classic Effects:**
- 🌼 Crysanthemum - Traditional burst pattern
- 🌴 Palm - Long-trailing palm effect
- ⭕ Ring - Perfect circular ring
- 💥 Crackle - Crackling sparkle effect
- ✨ Strobe - Flash and strobe patterns
- 👻 Ghost - Invisible burst with trailing colors
- 🌿 Willow - Drooping willow branches
- 🐴 Horse Tail - Thick trailing tails
- ✖️ Crossette - Splitting crossette pattern
- 🌸 Floral - Flower bloom effect
- 🍂 Falling Leaves - Gentle falling particles

**New Effects:**
- 💝 Heart - Romantic heart-shaped pattern
- 🌀 Spiral - Rotating spiral arms
- 👑 Kamuro - Japanese long-trailing effect
- ⭐ Star - Five-pointed star shape
- ⭕⭕ Double Ring - Dual concentric rings
- ⛲ Fountain - Upward fountain spray
- 🌊 Wave - Undulating wave pattern

## Run Locally

Open `index.html` in a local server (recommended) or directly in a browser.

Simple local server options:
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve

# Using package.json script
npm run dev
```

Then visit `http://localhost:8080`

## Project Structure

```
├── index.html           # App entry point
├── css/
│   └── style.css       # Styles
├── js/
│   ├── app/            # Application modules
│   │   ├── audio.js    # Sound manager
│   │   ├── colors.js   # Color definitions
│   │   ├── constants.js # App constants
│   │   ├── input.js    # Input handlers
│   │   ├── loop.js     # Main render loop
│   │   ├── main.js     # App initialization
│   │   ├── particles.js # Particle systems
│   │   ├── perf.js     # Performance monitoring
│   │   ├── shells.js   # Shell/firework logic
│   │   ├── state.js    # State management
│   │   ├── ui.js       # UI components
│   │   └── words.js    # Text rendering
│   ├── fscreen.js      # Fullscreen helper
│   ├── MyMath.js       # Math utilities
│   ├── Stage.js        # Canvas stage manager
│   └── script.js       # Module entry
├── audio/              # Sound files
├── fonts/              # Custom fonts
└── images/             # Image assets
```

## Development

- **Debug mode**: Add `?debug=1` to the URL for FPS/particle overlay
- **ES Modules**: All code uses native ES modules (no build step required)
- **Performance**: Automatically adjusts quality based on device capabilities

## Technologies

- Vanilla JavaScript (ES6+)
- Canvas API for rendering
- Web Audio API for sound
- CSS3 for UI

## License

MIT
