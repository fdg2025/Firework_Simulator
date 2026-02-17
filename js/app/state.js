import { QUALITY_LOW, QUALITY_NORMAL, QUALITY_HIGH, SKY_LIGHT_DIM, SKY_LIGHT_NORMAL } from "./constants.js";

export function createStore({ isFullscreen, isHeader, isLowEndDevice, isHighEndDevice, isDesktop, getDefaultScaleFactor }) {
	const store = {
		_listeners: new Set(),
		_dispatch(prevState) {
			this._listeners.forEach((listener) => listener(this.state, prevState));
		},

		state: {
			paused: true,
			soundEnabled: true,
			menuOpen: false,
			openHelpTopic: null,
			fullscreen: isFullscreen(),
			config: {
				quality: String(isHighEndDevice ? QUALITY_HIGH : QUALITY_NORMAL),
				shell: "Random",
				size: isDesktop ? "3" : isHeader ? "1.2" : "2",
				wordShell: true,
				autoLaunch: true,
				finale: true,
				skyLighting: SKY_LIGHT_NORMAL + "",
				hideControls: isHeader,
				longExposure: false,
				scaleFactor: getDefaultScaleFactor(),
			},
		},

		setState(nextState) {
			const prevState = this.state;
			this.state = Object.assign({}, this.state, nextState);
			this._dispatch(prevState);
			this.persist();
		},

		subscribe(listener) {
			this._listeners.add(listener);
			return () => this._listeners.remove(listener);
		},

		load() {
			const serializedData = localStorage.getItem("cm_fireworks_data");
			if (serializedData) {
				const { schemaVersion, data } = JSON.parse(serializedData);

				const config = this.state.config;
				switch (schemaVersion) {
					case "1.1":
						config.quality = data.quality;
						config.size = data.size;
						config.skyLighting = data.skyLighting;
						break;
					case "1.2":
						config.quality = data.quality;
						config.size = data.size;
						config.skyLighting = data.skyLighting;
						config.scaleFactor = data.scaleFactor;
						break;
					default:
						throw new Error("version switch should be exhaustive");
				}
				if (window.location.search.includes("debug=1")) {
					console.log(`Loaded config (schema version ${schemaVersion})`);
				}
			} else if (localStorage.getItem("schemaVersion") === "1") {
				let size;
				try {
					const sizeRaw = localStorage.getItem("configSize");
					size = typeof sizeRaw === "string" && JSON.parse(sizeRaw);
				} catch (e) {
					console.warn("Failed to parse legacy config, using defaults:", e);
					return;
				}
				const sizeInt = parseInt(size, 10);
				if (sizeInt >= 0 && sizeInt <= 4) {
					this.state.config.size = String(sizeInt);
				}
			}
		},

		persist() {
			const config = this.state.config;
			localStorage.setItem(
				"cm_fireworks_data",
				JSON.stringify({
					schemaVersion: "1.2",
					data: {
						quality: config.quality,
						size: config.size,
						skyLighting: config.skyLighting,
						scaleFactor: config.scaleFactor,
					},
				})
			);
		},
	};

	if (!isHeader) {
		store.load();
	}

	const hasSavedConfig = (() => {
		try {
			return !!localStorage.getItem("cm_fireworks_data") || localStorage.getItem("schemaVersion") === "1";
		} catch (error) {
			return false;
		}
	})();

	if (!hasSavedConfig && isLowEndDevice) {
		store.state.config.quality = String(QUALITY_LOW);
		store.state.config.skyLighting = SKY_LIGHT_DIM + "";
		store.state.config.scaleFactor = Math.min(store.state.config.scaleFactor, 0.85);
		store.state.config.finale = false;
	}

	return store;
}

export const selectors = {
	isRunning: (state) => !state.paused && !state.menuOpen,
	soundEnabled: (state) => state.soundEnabled,
	canPlaySound: (state) => !state.paused && !state.menuOpen && state.soundEnabled,
	quality: (state) => +state.config.quality,
	shellName: (state) => state.config.shell,
	shellSize: (state) => +state.config.size,
	finale: (state) => state.config.finale,
	skyLighting: (state) => +state.config.skyLighting,
	scaleFactor: (state) => state.config.scaleFactor,
	wordShell: (state) => state.config.wordShell,
};

export function createActions(store, { soundManager, onConfigDidUpdate }) {
	function togglePause(toggle) {
		const paused = store.state.paused;
		let newValue;
		if (typeof toggle === "boolean") {
			newValue = toggle;
		} else {
			newValue = !paused;
		}

		if (paused !== newValue) {
			store.setState({ paused: newValue });
		}
	}

	function toggleSound(toggle) {
		if (typeof toggle === "boolean") {
			store.setState({ soundEnabled: toggle });
		} else {
			store.setState({ soundEnabled: !store.state.soundEnabled });
		}
		if (store.state.soundEnabled) {
			soundManager.ensurePreloaded();
		}
	}

	function toggleMenu(toggle) {
		if (typeof toggle === "boolean") {
			store.setState({ menuOpen: toggle });
		} else {
			store.setState({ menuOpen: !store.state.menuOpen });
		}
	}

	function updateConfig(nextConfig) {
		store.setState({
			config: Object.assign({}, store.state.config, nextConfig),
		});
		if (onConfigDidUpdate) {
			onConfigDidUpdate();
		}
	}

	return {
		togglePause,
		toggleSound,
		toggleMenu,
		updateConfig,
	};
}
