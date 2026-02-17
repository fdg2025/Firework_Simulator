export const IS_MOBILE = window.innerWidth <= 640;
export const IS_DESKTOP = window.innerWidth > 800;
export const IS_HEADER = IS_DESKTOP && window.innerHeight < 300;
export const IS_LOW_END_DEVICE = (() => {
	const memory = navigator.deviceMemory || 4;
	const cores = navigator.hardwareConcurrency || 4;
	return IS_MOBILE && (memory <= 3 || cores <= 4);
})();
export const IS_HIGH_END_DEVICE = (() => {
	const hwConcurrency = navigator.hardwareConcurrency;
	if (!hwConcurrency) {
		return false;
	}
	const minCount = window.innerWidth <= 1024 ? 4 : 8;
	return hwConcurrency >= minCount;
})();

export const MAX_WIDTH = 7680;
export const MAX_HEIGHT = 4320;
export const GRAVITY = 0.9;

export const QUALITY_LOW = 1;
export const QUALITY_NORMAL = 2;
export const QUALITY_HIGH = 3;

export const SKY_LIGHT_NONE = 0;
export const SKY_LIGHT_DIM = 1;
export const SKY_LIGHT_NORMAL = 2;

export const PI_2 = Math.PI * 2;
export const PI_HALF = Math.PI * 0.5;

export function getDefaultScaleFactor() {
	if (IS_MOBILE) return 0.9;
	if (IS_HEADER) return 0.75;
	return 1;
}
