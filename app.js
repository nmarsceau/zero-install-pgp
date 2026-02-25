(function () {
	"use strict";

	const elements = {
		inputText: document.getElementById("input-text"),
		secretKey: document.getElementById("secret-key"),
		toggleSecretVisibilityBtn: document.getElementById("toggle-secret-visibility-btn"),
		encryptBtn: document.getElementById("encrypt-btn"),
		decryptBtn: document.getElementById("decrypt-btn"),
		copyOutputBtn: document.getElementById("copy-output-btn"),
		clearBtn: document.getElementById("clear-btn"),
		outputText: document.getElementById("output-text"),
		statusText: document.getElementById("status-text")
	};

	let isBusy = false;
	let isSecretVisible = false;

	function setStatus(message, kind) {
		elements.statusText.textContent = message || "";
		elements.statusText.dataset.kind = kind || "";
	}

	function renderOutput(text) {
		elements.outputText.textContent = text || "";
		updateVisibility();
	}

	function setBusy(nextBusy) {
		isBusy = nextBusy;

		elements.encryptBtn.disabled = nextBusy;
		elements.decryptBtn.disabled = nextBusy;
		elements.copyOutputBtn.disabled = nextBusy;
		elements.clearBtn.disabled = nextBusy;
	}

	function validateInputs(mode) {
		const input = elements.inputText.value.trim();
		const password = elements.secretKey.value;

		if (!input) {
			throw new Error(mode === "encrypt" ? "Enter plaintext to encrypt." : "Enter armored ciphertext to decrypt.");
		}

		if (!password.trim()) {
			throw new Error("Enter a password before continuing.");
		}

		return { input, password };
	}

	function normalizeError(error, mode) {
		const rawMessage = error && typeof error.message === "string" ? error.message : String(error || "Unknown error");
		const message = rawMessage.toLowerCase();

		if (message.includes("enter plaintext") || message.includes("enter armored ciphertext") || message.includes("enter a password")) {
			return rawMessage;
		}

		if (mode === "decrypt") {
			if (
				message.includes("session key decryption failed") ||
				message.includes("password") ||
				message.includes("decrypt") ||
				message.includes("checksum")
			) {
				return "Decryption failed. Check that the ciphertext is valid and the password is correct.";
			}

			if (message.includes("armored") || message.includes("parse") || message.includes("packet") || message.includes("format")) {
				return "Input does not look like valid armored OpenPGP ciphertext.";
			}
		}

		if (mode === "encrypt" && message.includes("openpgp")) {
			return "Encryption failed due to an OpenPGP.js error.";
		}

		return mode === "encrypt"
			? "Encryption failed. Please try again."
			: "Decryption failed. Please try again.";
	}

	async function encryptText() {
		const { input, password } = validateInputs("encrypt");

		const message = await openpgp.createMessage({ text: input });
		const encrypted = await openpgp.encrypt({
			message,
			passwords: [password],
			format: "armored"
		});

		renderOutput(encrypted);
		setStatus("Encrypted successfully.", "success");
	}

	async function decryptText() {
		const { input, password } = validateInputs("decrypt");

		const message = await openpgp.readMessage({ armoredMessage: input });
		const decrypted = await openpgp.decrypt({
			message,
			passwords: [password],
			format: "utf8"
		});

		renderOutput(decrypted.data);
		setStatus("Decrypted successfully.", "success");
	}

	async function runAction(actionName) {
		if (isBusy) {
			return;
		}

		if (!window.openpgp) {
			setStatus("OpenPGP.js failed to load. Check your network connection and refresh the page.", "error");
			return;
		}

		setBusy(true);
		setStatus(actionName === "encrypt" ? "Encrypting..." : "Decrypting...", "info");

		try {
			if (actionName === "encrypt") {
				await encryptText();
			} else {
				await decryptText();
			}
		} catch (error) {
			setStatus(normalizeError(error, actionName), "error");
		} finally {
			setBusy(false);
		}
	}

	async function copyOutput() {
		const value = elements.outputText.textContent || "";

		if (!value) {
			setStatus("Nothing to copy yet.", "error");
			return;
		}

		if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
			setStatus("Clipboard API is unavailable in this browser/context.", "error");
			return;
		}

		try {
			await navigator.clipboard.writeText(value);
			setStatus("Output copied to clipboard.", "success");
		} catch (_error) {
			setStatus("Could not copy output. Try selecting and copying manually.", "error");
		}
	}

	function clearAll() {
		if (isBusy) {
			return;
		}

		elements.inputText.value = "";
		elements.secretKey.value = "";
		setSecretVisibility(false);
		renderOutput("");
		setStatus("", "");
		elements.inputText.focus();
		updateVisibility();
	}

	function setSecretVisibility(shouldShow) {
		isSecretVisible = shouldShow;
		elements.secretKey.type = shouldShow ? "text" : "password";
		elements.toggleSecretVisibilityBtn.textContent = shouldShow ? "Hide" : "Show";
		elements.toggleSecretVisibilityBtn.setAttribute("aria-pressed", String(shouldShow));
		elements.toggleSecretVisibilityBtn.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
	}

	function toggleHidden(element, shouldHide) {
		element.classList.toggle("is-hidden", shouldHide);
	}

	function updateVisibility() {
		const hasInput = elements.inputText.value.trim().length > 0;
		const hasPassword = elements.secretKey.value.length > 0;
		const hasOutput = (elements.outputText.textContent || "").length > 0;

		toggleHidden(elements.clearBtn, !(hasInput || hasPassword || hasOutput));
		toggleHidden(elements.copyOutputBtn, !hasOutput);
	}

	function attachEvents() {
		elements.encryptBtn.addEventListener("click", function () {
			void runAction("encrypt");
		});

		elements.decryptBtn.addEventListener("click", function () {
			void runAction("decrypt");
		});

		elements.copyOutputBtn.addEventListener("click", function () {
			void copyOutput();
		});

		elements.toggleSecretVisibilityBtn.addEventListener("click", function () {
			setSecretVisibility(!isSecretVisible);
		});

		elements.clearBtn.addEventListener("click", clearAll);

		elements.inputText.addEventListener("input", updateVisibility);
		elements.secretKey.addEventListener("input", updateVisibility);
	}

	attachEvents();
	setSecretVisibility(false);
	updateVisibility();
	setStatus("Ready.", "info");
	elements.inputText.focus();
})();
