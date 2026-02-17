export const debugMetrics = {
	enabled: /(?:\?|&)debug=1(?:&|$)/.test(window.location.search),
	overlay: null,
	lastTime: 0,
	frameCount: 0,
	fps: 0,
	stars: 0,
	sparks: 0,
};

export const perfTuning = {
	enabled: true,
	targetFps: 55,
	minScale: 0.6,
	maxScale: 1,
	sampleMs: 500,
	lastTime: 0,
	frameCount: 0,
	lastFps: 0,
	scale: 1,
};

export function setupDebugOverlay() {
	if (!debugMetrics.enabled || debugMetrics.overlay) return;
	const overlay = document.createElement("div");
	overlay.style.position = "fixed";
	overlay.style.top = "8px";
	overlay.style.right = "8px";
	overlay.style.zIndex = "9999";
	overlay.style.padding = "6px 8px";
	overlay.style.background = "rgba(0, 0, 0, 0.55)";
	overlay.style.color = "#9efc9e";
	overlay.style.font = "12px/1.3 monospace";
	overlay.style.border = "1px solid rgba(255, 255, 255, 0.2)";
	overlay.style.borderRadius = "4px";
	overlay.textContent = "FPS: -- | Stars: -- | Sparks: --";
	document.body.appendChild(overlay);
	debugMetrics.overlay = overlay;
	debugMetrics.lastTime = performance.now();
}

export function updatePerfTuning() {
	if (!perfTuning.enabled) return;
	if (!perfTuning.lastTime) {
		perfTuning.lastTime = performance.now();
	}
	perfTuning.frameCount++;
	const now = performance.now();
	const elapsed = now - perfTuning.lastTime;
	if (elapsed < perfTuning.sampleMs) return;

	const fps = (perfTuning.frameCount * 1000) / elapsed;
	perfTuning.lastFps = fps;
	perfTuning.frameCount = 0;
	perfTuning.lastTime = now;

	if (fps < perfTuning.targetFps - 5) {
		perfTuning.scale = Math.max(perfTuning.minScale, perfTuning.scale - 0.05);
	} else if (fps > perfTuning.targetFps + 5) {
		perfTuning.scale = Math.min(perfTuning.maxScale, perfTuning.scale + 0.02);
	}
}
