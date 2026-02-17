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

// ===== Configurable Parameters =====

/**
 * Particle System Configuration
 */
export const PARTICLE_CONFIG = {
	// Star particle counts by quality
	STAR_COUNT_LOW: 300,
	STAR_COUNT_NORMAL: 600,
	STAR_COUNT_HIGH: 1200,
	
	// Star spawn rate (particles per frame)
	STAR_SPAWN_RATE_LOW: 5,
	STAR_SPAWN_RATE_NORMAL: 10,
	STAR_SPAWN_RATE_HIGH: 20,
	
	// Particle physics
	DRAG: 0.98,              // Air resistance
	TRAIL_LENGTH: 3,         // Length of particle trails
	GLOW_RADIUS: 30,         // Glow effect radius
	
	// Spark particle counts per shell
	SPARK_COUNT_MIN: 25,
	SPARK_COUNT_MAX: 100,
	SPARK_COUNT_CROSSETTE: 16,
	SPARK_COUNT_CRACKLE: 80,
	SPARK_COUNT_FLORAL: 60,
};

/**
 * Firework Shell Configuration
 */
export const SHELL_CONFIG = {
	// Shell size ranges (in pixels)
	SIZE_MIN: 2,
	SIZE_MAX: 10,
	SIZE_RANDOM_MIN: 3,
	SIZE_RANDOM_MAX: 12,
	
	// Launch velocity
	VELOCITY_MIN: 10,
	VELOCITY_MAX: 25,
	VELOCITY_MULTIPLIER: 1.5,
	
	// Shell spread patterns
	SPREAD_NORMAL: 1.0,
	SPREAD_PALM: 0.25,
	SPREAD_RING: 1.5,
	SPREAD_CROSSETTE: 2.0,
	
	// Explosion delays (milliseconds)
	EXPLOSION_DELAY_MIN: 800,
	EXPLOSION_DELAY_MAX: 1800,
	
	// Burst particle counts
	BURST_PARTICLE_MIN: 30,
	BURST_PARTICLE_MAX: 120,
};

/**
 * Visual Effects Configuration
 */
export const VISUAL_CONFIG = {
	// Canvas opacity for trail effect
	FADE_OPACITY: 0.15,
	FADE_OPACITY_LONG_EXPOSURE: 0.01,
	
	// Color brightness
	COLOR_BRIGHTNESS_MIN: 0.5,
	COLOR_BRIGHTNESS_MAX: 1.0,
	
	// Glow effects
	ENABLE_GLOW: true,
	GLOW_INTENSITY: 0.8,
	
	// Sky light intensity
	SKY_LIGHT_INTENSITY: 0.12,
	SKY_LIGHT_FADE: 0.98,
	
	// Flash effects
	FLASH_DURATION: 300,         // milliseconds
	FLASH_OPACITY_MAX: 0.5,
};

/**
 * Performance Configuration
 */
export const PERF_CONFIG = {
	// Target frame rates
	FPS_TARGET: 60,
	FPS_LOW_END: 30,
	
	// Update intervals (milliseconds)
	STATS_UPDATE_INTERVAL: 1000,
	
	// Quality scaling
	AUTO_QUALITY_ADJUST: true,
	QUALITY_CHECK_INTERVAL: 5000,
	
	// Particle limits
	MAX_PARTICLES_LOW: 1000,
	MAX_PARTICLES_NORMAL: 3000,
	MAX_PARTICLES_HIGH: 5000,
};

/**
 * Auto-Launch Configuration
 */
export const AUTO_LAUNCH_CONFIG = {
	ENABLED: false,
	MIN_DELAY: 800,              // milliseconds
	MAX_DELAY: 2000,
	MAX_SIMULTANEOUS: 3,         // Maximum simultaneous fireworks
};

/**
 * Audio Configuration
 */
export const AUDIO_CONFIG = {
	ENABLED: true,
	VOLUME_LIFT: 0.7,            // Launch sound volume
	VOLUME_BURST: 0.5,           // Explosion sound volume
	VOLUME_CRACKLE: 0.3,         // Crackle sound volume
	MAX_CONCURRENT_SOUNDS: 10,
};

/**
 * Input Configuration
 */
export const INPUT_CONFIG = {
	DOUBLE_CLICK_DELAY: 300,     // milliseconds
	TOUCH_HOLD_DELAY: 500,
	MOUSE_MOVE_THROTTLE: 16,     // ~60fps
};

/**
 * Get configuration value with fallback
 */
export function getConfig(category, key, fallback = null) {
	const configs = {
		particle: PARTICLE_CONFIG,
		shell: SHELL_CONFIG,
		visual: VISUAL_CONFIG,
		perf: PERF_CONFIG,
		autoLaunch: AUTO_LAUNCH_CONFIG,
		audio: AUDIO_CONFIG,
		input: INPUT_CONFIG,
	};
	
	const config = configs[category];
	if (!config) return fallback;
	
	return config[key] !== undefined ? config[key] : fallback;
}

