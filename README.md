# Zero-Install PGP

Simple single-page app to symmetrically encrypt/decrypt text in the browser using OpenPGP.js.

Usage

- Open `index.html` in your browser, or run a simple static server in the repository root:

```bash
npx http-server .
```

- Enter the plaintext (or armored ciphertext), enter a password, choose mode (default: Encrypt), then click the action button.

Notes

- This app loads OpenPGP.js from the unpkg CDN. No build step required.
- For local testing, use a static server rather than opening via file:// for best compatibility with clipboard APIs.
- This utility was build using GPT-5.3-Codex.
