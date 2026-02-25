# Zero-Install PGP

Simple single-page app to symmetrically encrypt/decrypt text in the browser using OpenPGP.js.

<img width="1000" height="891" alt="Desktop-sized screen of Zero-Install PGP running in the browser." src="https://github.com/user-attachments/assets/734b7382-ff26-421e-8374-7e8475adc48c" />

Deployed site: [nmarsceau.github.io/zero-install-pgp](https://nmarsceau.github.io/zero-install-pgp/)

Enter the plaintext (or armored ciphertext), enter a password, then click an action button (Encrypt/Decrypt).

Notes

- This utility was build using GPT-5.3-Codex.
- This app loads OpenPGP.js from the unpkg CDN. No build step required.
- For local testing, run `npm start` to use a static server rather than opening via file:// for best compatibility with clipboard APIs.
