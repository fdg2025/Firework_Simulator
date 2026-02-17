export function createUI({
	store,
	selectors,
	actions,
	soundManager,
	setupDebugOverlay,
	fullscreenEnabled,
	toggleFullscreen,
	handleResize,
	shellNames,
	qualityOptions,
	skyLightingOptions,
	scaleOptions,
}) {
	const helpContent = {
		shellType: {
			header: "烟花类型",
			body: "你要放的烟花的类型，选择“随机（Random）”可以获得非常好的体验！",
		},
		shellSize: {
			header: "烟花大小",
			body: "烟花越大绽放范围就越大，但是烟花越大，设备所需的性能也会增多，大的烟花可能导致你的设备卡顿。",
		},
		quality: {
			header: "画质",
			body: "如果动画运行不流畅，你可以试试降低画质。画质越高，烟花绽放后的火花数量就越多，但高画质可能导致你的设备卡顿。",
		},
		skyLighting: {
			header: "照亮天空",
			body: "烟花爆炸时，背景会被照亮。如果你的屏幕看起来太亮了，可以把它改成“暗”或者“不”。",
		},
		scaleFactor: {
			header: "缩放",
			body: "使你与烟花离得更近或更远。对于较大的烟花，你可以选择更小的缩放值，尤其是在手机或平板电脑上。",
		},
		wordShell: {
			header: "文字烟花",
			body: "开启后，会出现烟花形状的文字。例如：新年快乐、心想事成等等",
		},
		autoLaunch: {
			header: "自动放烟花",
			body: "开启后你就可以坐在你的设备屏幕前面欣赏烟花了，你也可以关闭它，但关闭后你就只能通过点击屏幕的方式来放烟花。",
		},
		finaleMode: {
			header: "同时放更多的烟花",
			body: "可以在同一时间自动放出更多的烟花（但需要开启先开启“自动放烟花”）。",
		},
		hideControls: {
			header: "隐藏控制按钮",
			body: "隐藏屏幕顶部的按钮。如果你要截图，或者需要一个无缝的体验，你就可以将按钮隐藏，隐藏按钮后你仍然可以在右上角打开设置。",
		},
		fullscreen: {
			header: "全屏",
			body: "切换至全屏模式",
		},
		longExposure: {
			header: "保留烟花的火花",
			body: "可以保留烟花留下的火花",
		},
	};

	const nodeKeyToHelpKey = {
		shellTypeLabel: "shellType",
		shellSizeLabel: "shellSize",
		qualityLabel: "quality",
		skyLightingLabel: "skyLighting",
		scaleFactorLabel: "scaleFactor",
		wordShellLabel: "wordShell",
		autoLaunchLabel: "autoLaunch",
		finaleModeLabel: "finaleMode",
		hideControlsLabel: "hideControls",
		fullscreenLabel: "fullscreen",
		longExposureLabel: "longExposure",
	};

	const appNodes = {
		stageContainer: ".stage-container",
		canvasContainer: ".canvas-container",
		controls: ".controls",
		menu: ".menu",
		menuInnerWrap: ".menu__inner-wrap",
		pauseBtn: ".pause-btn",
		pauseBtnSVG: ".pause-btn use",
		soundBtn: ".sound-btn",
		soundBtnSVG: ".sound-btn use",
		audioHint: ".audio-hint",
		tapHint: ".tap-hint",
		shellType: ".shell-type",
		shellTypeLabel: ".shell-type-label",
		shellSize: ".shell-size",
		shellSizeLabel: ".shell-size-label",
		quality: ".quality-ui",
		qualityLabel: ".quality-ui-label",
		skyLighting: ".sky-lighting",
		skyLightingLabel: ".sky-lighting-label",
		scaleFactor: ".scaleFactor",
		scaleFactorLabel: ".scaleFactor-label",
		wordShell: ".word-shell",
		wordShellLabel: ".word-shell-label",
		autoLaunch: ".auto-launch",
		autoLaunchLabel: ".auto-launch-label",
		finaleModeFormOption: ".form-option--finale-mode",
		finaleMode: ".finale-mode",
		finaleModeLabel: ".finale-mode-label",
		hideControls: ".hide-controls",
		hideControlsLabel: ".hide-controls-label",
		fullscreenFormOption: ".form-option--fullscreen",
		fullscreen: ".fullscreen",
		fullscreenLabel: ".fullscreen-label",
		longExposure: ".long-exposure",
		longExposureLabel: ".long-exposure-label",
		helpModal: ".help-modal",
		helpModalOverlay: ".help-modal__overlay",
		helpModalHeader: ".help-modal__header",
		helpModalBody: ".help-modal__body",
		helpModalCloseBtn: ".help-modal__close-btn",
	};

	Object.keys(appNodes).forEach((key) => {
		appNodes[key] = document.querySelector(appNodes[key]);
	});

	const audioUnlockState = {
		unlocked: false,
		requested: false,
	};

	const tapHintState = {
		hidden: false,
	};

	function hideTapHint() {
		if (!appNodes.tapHint || tapHintState.hidden) return;
		appNodes.tapHint.classList.add("hide");
		tapHintState.hidden = true;
	}

	function updateAudioHint() {
		if (!appNodes.audioHint) return;
		const shouldShow = selectors.soundEnabled(store.state) && !audioUnlockState.unlocked && soundManager.ctx.state !== "running";
		appNodes.audioHint.classList.toggle("hide", !shouldShow);
	}

	function requestAudioUnlock() {
		if (audioUnlockState.unlocked || audioUnlockState.requested) return;
		if (!selectors.soundEnabled(store.state)) return;
		audioUnlockState.requested = true;
		soundManager.ensurePreloaded();
		soundManager.resumeAll();
		setTimeout(() => {
			if (soundManager.ctx.state === "running") {
				audioUnlockState.unlocked = true;
			}
			audioUnlockState.requested = false;
			updateAudioHint();
		}, 400);
	}

	["pointerdown", "touchend", "click"].forEach((eventName) => {
		document.addEventListener(eventName, requestAudioUnlock, { passive: true });
	});

	if (!fullscreenEnabled()) {
		appNodes.fullscreenFormOption.classList.add("remove");
	}

	function renderApp(state) {
		const pauseBtnIcon = `#icon-${state.paused ? "play" : "pause"}`;
		const soundBtnIcon = `#icon-sound-${selectors.soundEnabled(state) ? "on" : "off"}`;
		appNodes.pauseBtnSVG.setAttribute("href", pauseBtnIcon);
		appNodes.pauseBtnSVG.setAttribute("xlink:href", pauseBtnIcon);
		appNodes.soundBtnSVG.setAttribute("href", soundBtnIcon);
		appNodes.soundBtnSVG.setAttribute("xlink:href", soundBtnIcon);
		appNodes.controls.classList.toggle("hide", state.menuOpen || state.config.hideControls);
		appNodes.canvasContainer.classList.toggle("blur", state.menuOpen);
		appNodes.menu.classList.toggle("hide", !state.menuOpen);
		appNodes.finaleModeFormOption.style.opacity = state.config.autoLaunch ? 1 : 0.32;

		appNodes.quality.value = state.config.quality;
		appNodes.shellType.value = state.config.shell;
		appNodes.shellSize.value = state.config.size;
		appNodes.wordShell.checked = state.config.wordShell;
		appNodes.autoLaunch.checked = state.config.autoLaunch;
		appNodes.finaleMode.checked = state.config.finale;
		appNodes.skyLighting.value = state.config.skyLighting;
		appNodes.hideControls.checked = state.config.hideControls;
		appNodes.fullscreen.checked = state.fullscreen;
		appNodes.longExposure.checked = state.config.longExposure;
		appNodes.scaleFactor.value = state.config.scaleFactor.toFixed(2);

		appNodes.menuInnerWrap.style.opacity = state.openHelpTopic ? 0.12 : 1;
		appNodes.helpModal.classList.toggle("active", !!state.openHelpTopic);
		if (state.openHelpTopic) {
			const { header, body } = helpContent[state.openHelpTopic];
			appNodes.helpModalHeader.textContent = header;
			appNodes.helpModalBody.textContent = body;
		}

		updateAudioHint();
	}

	store.subscribe(renderApp);

	function handleStateChange(state, prevState) {
		const canPlaySound = selectors.canPlaySound(state);
		const canPlaySoundPrev = selectors.canPlaySound(prevState);

		if (canPlaySound !== canPlaySoundPrev) {
			if (canPlaySound) {
				soundManager.resumeAll();
			} else {
				soundManager.pauseAll();
			}
			updateAudioHint();
		}
	}

	store.subscribe(handleStateChange);

	function getConfigFromDOM() {
		return {
			quality: appNodes.quality.value,
			shell: appNodes.shellType.value,
			size: appNodes.shellSize.value,
			wordShell: appNodes.wordShell.checked,
			autoLaunch: appNodes.autoLaunch.checked,
			finale: appNodes.finaleMode.checked,
			skyLighting: appNodes.skyLighting.value,
			longExposure: appNodes.longExposure.checked,
			hideControls: appNodes.hideControls.checked,
			scaleFactor: parseFloat(appNodes.scaleFactor.value),
		};
	}

	const updateConfigNoEvent = () => actions.updateConfig(getConfigFromDOM());
	appNodes.quality.addEventListener("input", updateConfigNoEvent);
	appNodes.shellType.addEventListener("input", updateConfigNoEvent);
	appNodes.shellSize.addEventListener("input", updateConfigNoEvent);
	appNodes.wordShell.addEventListener("click", () => setTimeout(updateConfigNoEvent, 0));
	appNodes.autoLaunch.addEventListener("click", () => setTimeout(updateConfigNoEvent, 0));
	appNodes.finaleMode.addEventListener("click", () => setTimeout(updateConfigNoEvent, 0));
	appNodes.skyLighting.addEventListener("input", updateConfigNoEvent);
	appNodes.longExposure.addEventListener("click", () => setTimeout(updateConfigNoEvent, 0));
	appNodes.hideControls.addEventListener("click", () => setTimeout(updateConfigNoEvent, 0));
	appNodes.fullscreen.addEventListener("click", () => setTimeout(toggleFullscreen, 0));
	appNodes.scaleFactor.addEventListener("input", () => {
		updateConfigNoEvent();
		handleResize();
	});

	Object.keys(nodeKeyToHelpKey).forEach((nodeKey) => {
		const helpKey = nodeKeyToHelpKey[nodeKey];
		appNodes[nodeKey].addEventListener("click", () => {
			store.setState({ openHelpTopic: helpKey });
		});
	});

	appNodes.helpModalCloseBtn.addEventListener("click", () => {
		store.setState({ openHelpTopic: null });
	});

	appNodes.helpModalOverlay.addEventListener("click", () => {
		store.setState({ openHelpTopic: null });
	});

	function setOptionsForSelect(node, options) {
		node.innerHTML = options.reduce((acc, opt) => (acc += `<option value="${opt.value}">${opt.label}</option>`), "");
	}

	function initUI() {
		document.querySelector(".loading-init").remove();
		appNodes.stageContainer.classList.remove("remove");
		setupDebugOverlay();

		let options = "";
		shellNames.forEach((opt) => (options += `<option value="${opt}">${opt}</option>`));
		appNodes.shellType.innerHTML = options;

		options = "";
		['3"', '4"', '6"', '8"', '12"', '16"'].forEach((opt, i) => (options += `<option value="${i}">${opt}</option>`));
		appNodes.shellSize.innerHTML = options;

		setOptionsForSelect(appNodes.quality, qualityOptions);
		setOptionsForSelect(appNodes.skyLighting, skyLightingOptions);
		setOptionsForSelect(appNodes.scaleFactor, scaleOptions);

		requestAnimationFrame(() => actions.togglePause(false));
		renderApp(store.state);
		setTimeout(hideTapHint, 3500);
	}

	return { appNodes, initUI, getConfigFromDOM, hideTapHint };
}
