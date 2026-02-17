import { fscreen } from "../fscreen.js";
import { Stage } from "../Stage.js";
import { MyMath } from "../MyMath.js";
import { soundManager, bindSoundState } from "./audio.js";
import { setupDebugOverlay } from "./perf.js";
import { randomWord, getWordDots } from "./words.js";
import {
	IS_DESKTOP,
	IS_HEADER,
	IS_HIGH_END_DEVICE,
	IS_LOW_END_DEVICE,
	MAX_HEIGHT,
	MAX_WIDTH,
	QUALITY_HIGH,
	QUALITY_LOW,
	QUALITY_NORMAL,
	SKY_LIGHT_DIM,
	SKY_LIGHT_NONE,
	SKY_LIGHT_NORMAL,
	getDefaultScaleFactor,
} from "./constants.js";
import * as colors from "./colors.js";
import { createStore, createActions, selectors } from "./state.js";
import { createUI } from "./ui.js";
import { BurstFlash, Spark, Star } from "./particles.js";
import { createShellSystem } from "./shells.js";
import { createLoop } from "./loop.js";
import { bindInput } from "./input.js";
import * as configUI from "./config.js";
import * as shareUI from "./share.js";

let stageW;
let stageH;
let quality = 1;
let isLowQuality = false;
let isNormalQuality = false;
let isHighQuality = true;

const trailsStage = new Stage("trails-canvas");
const mainStage = new Stage("main-canvas");
const stages = [trailsStage, mainStage];

let appNodes = null;

// 自定义背景
document.addEventListener("DOMContentLoaded", function () {
	const canvasContainer = document.querySelector(".canvas-container");
	canvasContainer.style.backgroundImage = "url()";
	canvasContainer.style.backgroundSize = "100%";
});

function fullscreenEnabled() {
	return fscreen.fullscreenEnabled;
}

function isFullscreen() {
	return !!fscreen.fullscreenElement;
}

function toggleFullscreen() {
	if (fullscreenEnabled()) {
		if (isFullscreen()) {
			fscreen.exitFullscreen();
		} else {
			fscreen.requestFullscreen(document.documentElement);
		}
	}
}

const store = createStore({
	isFullscreen,
	isHeader: IS_HEADER,
	isLowEndDevice: IS_LOW_END_DEVICE,
	isHighEndDevice: IS_HIGH_END_DEVICE,
	isDesktop: IS_DESKTOP,
	getDefaultScaleFactor,
});

fscreen.addEventListener("fullscreenchange", () => {
	store.setState({ fullscreen: isFullscreen() });
});

const selectorApi = {
	isRunning: () => selectors.isRunning(store.state),
	soundEnabled: () => selectors.soundEnabled(store.state),
	canPlaySound: () => selectors.canPlaySound(store.state),
	quality: () => selectors.quality(store.state),
	shellName: () => selectors.shellName(store.state),
	shellSize: () => selectors.shellSize(store.state),
	finale: () => selectors.finale(store.state),
	skyLighting: () => selectors.skyLighting(store.state),
	scaleFactor: () => selectors.scaleFactor(store.state),
	wordShell: () => selectors.wordShell(store.state),
};

function configDidUpdate() {
	quality = selectorApi.quality();
	isLowQuality = quality === QUALITY_LOW;
	isNormalQuality = quality === QUALITY_NORMAL;
	isHighQuality = quality === QUALITY_HIGH;

	if (selectorApi.skyLighting() === SKY_LIGHT_NONE && appNodes) {
		appNodes.canvasContainer.style.backgroundColor = "#000";
	}

	Spark.drawWidth = quality === QUALITY_HIGH ? 0.75 : 1;
}

function preallocateParticlePools() {
	const targetStarCount = isHighQuality ? 1200 : isNormalQuality ? 700 : 400;
	const targetSparkCount = isHighQuality ? 1800 : isNormalQuality ? 1000 : 600;
	if (Star._pool.length < targetStarCount) {
		Star.preallocate(targetStarCount - Star._pool.length);
	}
	if (Spark._pool.length < targetSparkCount) {
		Spark.preallocate(targetSparkCount - Spark._pool.length);
	}
}

const actions = createActions(store, { soundManager, onConfigDidUpdate: () => {
	configDidUpdate();
	preallocateParticlePools();
}});

function handleResize() {
	if (!appNodes) return;
	const viewport = window.visualViewport;
	const w = viewport ? viewport.width : window.innerWidth;
	const h = viewport ? viewport.height : window.innerHeight;
	const containerW = Math.min(w, MAX_WIDTH);
	const containerH = w <= 420 ? h : Math.min(h, MAX_HEIGHT);
	appNodes.stageContainer.style.width = containerW + "px";
	appNodes.stageContainer.style.height = containerH + "px";
	stages.forEach((stage) => stage.resize(containerW, containerH));
	const scaleFactor = selectorApi.scaleFactor();
	stageW = containerW / scaleFactor;
	stageH = containerH / scaleFactor;
}

const shellSystem = createShellSystem({
	selectors: {
		shellName: () => selectorApi.shellName(),
		shellSize: () => selectorApi.shellSize(),
		finale: () => selectorApi.finale(),
		wordShell: () => selectorApi.wordShell(),
	},
	getStageSize: () => ({ width: stageW, height: stageH }),
	getMainStageSize: () => ({ width: mainStage.width, height: mainStage.height }),
	isRunning: () => selectorApi.isRunning(),
	getQuality: () => ({ quality, isLowQuality, isNormalQuality, isHighQuality }),
	particles: { Star, Spark, BurstFlash },
	soundManager,
	myMath: MyMath,
	randomWord,
	getWordDots,
});

const ui = createUI({
	store,
	selectors: {
		soundEnabled: (state) => selectors.soundEnabled(state),
		canPlaySound: (state) => selectors.canPlaySound(state),
	},
	actions,
	soundManager,
	setupDebugOverlay,
	fullscreenEnabled,
	toggleFullscreen,
	handleResize,
	shellNames: shellSystem.shellNames,
	qualityOptions: [
		{ label: "低", value: QUALITY_LOW },
		{ label: "正常", value: QUALITY_NORMAL },
		{ label: "高", value: QUALITY_HIGH },
	],
	skyLightingOptions: [
		{ label: "不", value: SKY_LIGHT_NONE },
		{ label: "暗", value: SKY_LIGHT_DIM },
		{ label: "正常", value: SKY_LIGHT_NORMAL },
	],
	scaleOptions: [0.5, 0.62, 0.75, 0.9, 1.0, 1.5, 2.0].map((value) => ({ value: value.toFixed(2), label: `${value * 100}%` })),
});

appNodes = ui.appNodes;

// Account for window resize and custom scale changes.
handleResize();

window.addEventListener("resize", handleResize);
if (window.visualViewport) {
	window.visualViewport.addEventListener("resize", handleResize);
}

const loop = createLoop({
	mainStage,
	trailsStage,
	store,
	selectorApi,
	getStageSize: () => ({ width: stageW, height: stageH }),
	getQuality: () => ({ quality, isLowQuality, isNormalQuality, isHighQuality }),
	particles: { Star, Spark, BurstFlash },
	colors,
	getAppNodes: () => appNodes,
	shellSystem,
});

bindSoundState({
	canPlaySoundSelector: () => selectorApi.canPlaySound(),
	getSimSpeedValue: () => loop.getSimSpeed(),
});

bindInput({
	mainStage,
	selectorApi,
	loop,
	shellSystem,
	ui,
	actions,
});

// Initialize configuration UI
configUI.initConfigUI();
// Make configUI available globally for keyboard shortcuts
window.configUI = configUI;

// Initialize share UI
shareUI.initShareUI();
// Make shareUI available globally for keyboard shortcuts
window.shareUI = shareUI;

function setLoadingStatus(status) {
	document.querySelector(".loading-init__status").textContent = status;
}

if (IS_HEADER) {
	ui.initUI();
	configDidUpdate();
	preallocateParticlePools();
	shellSystem.scheduleIntroSequence();
} else {
	setLoadingStatus("正在点燃导火线");
	setTimeout(() => {
		ui.initUI();
		configDidUpdate();
		preallocateParticlePools();
		shellSystem.scheduleIntroSequence();
		if (selectorApi.soundEnabled()) {
			if ("requestIdleCallback" in window) {
				requestIdleCallback(() => soundManager.ensurePreloaded());
			} else {
				setTimeout(() => soundManager.ensurePreloaded(), 1500);
			}
		}
	}, 0);
}
