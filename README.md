# Scanly QR — Offline UPI Payment QR & Link QR Generator

[![Version](https://img.shields.io/badge/version-1.0.1-1c8a55.svg)](https://github.com/divyanshuyogi5675-lgtm/scanly-qr/releases/tag/v1.0.1)
[![Android](https://img.shields.io/badge/platform-Android-3ddc84.svg)](https://github.com/divyanshuyogi5675-lgtm/scanly-qr)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Scanly QR** is a free, privacy-first Android QR code generator for UPI payments, custom payment links, website URLs, and plain text. Create a UPI payment QR code with an optional amount and note, customize its visual template, then copy, share, or export it as a PNG.

The app is designed for people who want a simple QR generator without account creation, cloud storage, a database, or tracking.

## Free download

- **Latest release:** [Scanly QR v1.0.1](https://github.com/divyanshuyogi5675-lgtm/scanly-qr/releases/tag/v1.0.1)
- **Direct APK download:** [Download Scanly QR v1.0.1 APK](https://github.com/divyanshuyogi5675-lgtm/scanly-qr/releases/download/v1.0.1/scanly-qr-v1.0.1.apk)
- **Source code:** [Browse the repository](https://github.com/divyanshuyogi5675-lgtm/scanly-qr)
- **All releases:** [github.com/divyanshuyogi5675-lgtm/scanly-qr/releases](https://github.com/divyanshuyogi5675-lgtm/scanly-qr/releases)

> v1.0.1 includes a ready-to-install Android APK and the complete Expo/React Native source. Always verify the UPI ID and amount in your UPI app before confirming a payment.

## Highlights

- **UPI payment QR generator** — enter UPI ID, payee name, optional amount, and payment note.
- **Payment link builder** — creates a standard `upi://pay` intent that compatible UPI apps can read.
- **Website and custom link QR** — turn any URL into a scannable QR code.
- **Text QR generator** — encode a message, address, phone number, or any short text.
- **QR design templates** — Leaf, Midnight, Sunset, and Ink styles.
- **Copy, share, and export** — copy QR content, share the link, or export the QR as a PNG through Android’s native share sheet.
- **Offline-first privacy** — QR data is generated on the device; no login, cloud backend, database, or analytics is included.
- **Free and open source** — released under the MIT License.

## Privacy by design

Scanly QR does not require an account. It does not upload UPI IDs, payment notes, URLs, or text to a server. The app only uses the phone’s local capabilities to generate QR content and open the native Android share flow when you choose to share or export.

Scanly QR is a QR generator, not a bank or payment processor. It does not receive, hold, or automatically confirm money.

## Tech stack

- React Native + Expo
- TypeScript
- `react-native-qrcode-svg` for QR rendering
- Expo Clipboard, Sharing, FileSystem, and Linear Gradient modules
- Local app state only; no remote API or database

## Run locally

```bash
git clone https://github.com/divyanshuyogi5675-lgtm/scanly-qr.git
cd scanly-qr
npm install
npx expo start
```

Open the project with Expo Go on an Android phone, or use an Android development environment:

```bash
npx expo run:android
```

## Validate the Android bundle

```bash
npx tsc --noEmit
npx expo export --platform android
```

## Version history

### v1.0.1 — Custom branding and photo QR update

- Added Scanly custom app logo and splash screen.
- Added gallery photo selection with crop support.
- Added photo-backed QR templates and composite PNG export.
- Removed the old landing/privacy promo panel for a cleaner phone-first UI.

### v1.0.0 — Initial release

- UPI payment QR generation
- Link and text QR generation
- Four QR templates
- Copy, share, and PNG export actions
- Offline-only privacy model
- Android Expo project configuration

## Contributing

Bug reports, UI ideas, translations, and pull requests are welcome. Please keep the offline-only privacy model intact and do not add telemetry, login, or remote storage without a clearly documented product decision.

## License

Scanly QR is released under the [MIT License](LICENSE).
