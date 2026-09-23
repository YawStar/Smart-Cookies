# YawStar Smart Cookies 🍪

A lightweight and privacy-focused cross-browser extension to export cookies in **Netscape** or **JSON** format. Works on both **Google Chrome** and **Mozilla Firefox**.

## 🚀 Features
- Export cookies for the current tab or all tabs.
- Supports both Netscape (`cookies.txt`) and JSON formats.
- Supports Partitioned Cookies (CHIPS).
- Clean and responsive dark-mode UI.
- Direct Copy-to-Clipboard option.

## 📁 Project Structure
```text
YawStar-Smart-Cookies/
│   .gitignore
│   LICENSE
│   README.md
└───src
    ├───chrome    # Source files for Google Chrome
    │   │   background.js
    │   │   manifest.json
    │   │   popup.css
    │   │   popup.html
    │   │   popup.js
    │   │
    │   └───icons
    │           icon128.png
    │           icon16.png
    │           icon32.png
    │           icon48.png
    │           icon64.png
    │
    └───firefox   # Source files for Mozilla Firefox
        │   background.js
        │   manifest.json
        │   popup.css
        │   popup.html
        │   popup.js
        │
        └───icons
                icon128.png
                icon16.png
                icon32.png
                icon48.png
                icon64.png
```

## 🛠️ Installation (Developer Mode)

### Google Chrome
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `src/chrome` directory.

### Mozilla Firefox
1. Clone this repository.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` inside the `src/firefox` directory.

## 📝 License
This project is licensed under the [MIT License](LICENSE).