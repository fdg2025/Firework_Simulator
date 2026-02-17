/**
 * Binds input handlers for mouse, touch, and keyboard interactions
 * @param {Object} params - Input configuration
 * @param {Object} params.mainStage - Main canvas stage
 * @param {Object} params.selectorApi - State selector API
 * @param {Object} params.loop - Main loop API
 * @param {Object} params.shellSystem - Shell system API
 */
export function bindInput({
	mainStage,
	selectorApi,
	loop,
	shellSystem,
	ui,
	actions,
}) {
	let isUpdatingSpeed = false;

	mainStage.addEventListener("pointerstart", (event) => {
		ui.hideTapHint();
		const btnSize = 50;

		if (event.y < btnSize) {
			if (event.x < btnSize) {
				actions.togglePause();
				return;
			}
			if (event.x > mainStage.width / 2 - btnSize / 2 && event.x < mainStage.width / 2 + btnSize / 2) {
				actions.toggleSound();
				return;
			}
			if (event.x > mainStage.width - btnSize) {
				actions.toggleMenu();
				return;
			}
		}

		const handledSpeed = loop.startSpeedUpdate(event);
		isUpdatingSpeed = handledSpeed;
		if (handledSpeed) {
			return;
		}

		if (!selectorApi.isRunning()) return;
		if (event.onCanvas) {
			shellSystem.launchShellFromConfig(event);
		}
	});

	mainStage.addEventListener("pointermove", (event) => {
		if (!selectorApi.isRunning()) return;
		loop.maybeUpdateSpeed(event);
	});

	mainStage.addEventListener("pointerend", () => {
		isUpdatingSpeed = false;
		loop.stopSpeedUpdate();
	});

	mainStage.addEventListener("pointerout", () => {
		if (!isUpdatingSpeed) return;
		isUpdatingSpeed = false;
		loop.stopSpeedUpdate();
	});

	// Enhanced keyboard shortcuts
	window.addEventListener("keydown", (event) => {
		const key = event.key.toLowerCase();
		const keyCode = event.keyCode;

		// Don't trigger shortcuts if user is typing
		if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
			return;
		}

		// Existing shortcuts (P, O, ESC)
		if (keyCode === 80) { // P - Pause
			actions.togglePause();
			return;
		} else if (keyCode === 79) { // O - Menu
			actions.toggleMenu();
			return;
		} else if (keyCode === 27) { // ESC - Close menu
			actions.toggleMenu(false);
			return;
		}

		// New shortcuts
		switch (key) {
			case " ": // Space - Launch firework at center
				event.preventDefault();
				if (selectorApi.isRunning()) {
					const centerEvent = {
						x: mainStage.width / 2,
						y: mainStage.height / 2,
						onCanvas: true
					};
					shellSystem.launchShellFromConfig(centerEvent);
				}
				break;

			case "f": // F - Fullscreen
				event.preventDefault();
				const fullscreenBtn = document.querySelector(".btn--fullscreen");
				if (fullscreenBtn) fullscreenBtn.click();
				break;

			case "m": // M - Mute/Unmute
				event.preventDefault();
				actions.toggleSound();
				break;

			case "r": // R - Random mode
				event.preventDefault();
				const shellSelect = document.querySelector('select[name="shell"]');
				if (shellSelect) {
					shellSelect.value = "Random";
					shellSelect.dispatchEvent(new Event("change"));
					showKeyboardFeedback("随机模式");
				}
				break;

			case "a": // A - Toggle auto-launch
				event.preventDefault();
				const autoLaunchCheckbox = document.querySelector('input[name="autoLaunch"]');
				if (autoLaunchCheckbox) {
					autoLaunchCheckbox.click();
					showKeyboardFeedback(autoLaunchCheckbox.checked ? "自动发射: 开" : "自动发射: 关");
				}
				break;

			case "?": // ? - Show help
				event.preventDefault();
				showShortcutsHelp();
				break;

			// Quick shell type selection (1-9)
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				event.preventDefault();
				selectShellByNumber(parseInt(key));
				break;
		}
	});

	// Helper: Select shell by number
	function selectShellByNumber(num) {
		const shellSelect = document.querySelector('select[name="shell"]');
		if (!shellSelect) return;

		const options = Array.from(shellSelect.options);
		if (num > 0 && num <= options.length) {
			shellSelect.selectedIndex = num - 1;
			shellSelect.dispatchEvent(new Event("change"));
			showKeyboardFeedback(`烟花: ${options[num - 1].text}`);
		}
	}

	// Helper: Show keyboard feedback
	function showKeyboardFeedback(message) {
		const existing = document.querySelector(".keyboard-feedback");
		if (existing) existing.remove();

		const feedback = document.createElement("div");
		feedback.className = "keyboard-feedback";
		feedback.textContent = message;
		document.body.appendChild(feedback);

		setTimeout(() => {
			feedback.classList.add("fade-out");
			setTimeout(() => feedback.remove(), 300);
		}, 1500);
	}

	// Helper: Show shortcuts help
	function showShortcutsHelp() {
		const helpMessage = `
━━━ 键盘快捷键 ━━━

空格 - 发射烟花
P - 暂停/继续
M - 静音/取消静音
F - 全屏
A - 自动发射
R - 随机模式
O - 打开菜单
ESC - 关闭菜单
1-9 - 快速选择烟花类型
? - 显示此帮助
━━━━━━━━━━━━━━━
		`.trim();

		alert(helpMessage);
	}

	// First-time hint
	if (!localStorage.getItem("keyboardHintShown")) {
		setTimeout(() => {
			showKeyboardFeedback("提示: 按 ? 查看键盘快捷键");
			localStorage.setItem("keyboardHintShown", "true");
		}, 3000);
	}
}
