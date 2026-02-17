export const COLOR = {
	Red: "#ff0043",
	Green: "#14fc56",
	Blue: "#1e7fff",
	Purple: "#e60aff",
	Gold: "#ffbf36",
	White: "#ffffff",
};

export const INVISIBLE = "_INVISIBLE_";

export const COLOR_NAMES = Object.keys(COLOR);
export const COLOR_CODES = COLOR_NAMES.map((colorName) => COLOR[colorName]);
export const COLOR_CODES_W_INVIS = [...COLOR_CODES, INVISIBLE];
export const COLOR_CODE_INDEXES = COLOR_CODES_W_INVIS.reduce((obj, code, i) => {
	obj[code] = i;
	return obj;
}, {});
export const COLOR_TUPLES = {};
COLOR_CODES.forEach((hex) => {
	COLOR_TUPLES[hex] = {
		r: parseInt(hex.substr(1, 2), 16),
		g: parseInt(hex.substr(3, 2), 16),
		b: parseInt(hex.substr(5, 2), 16),
	};
});

export function randomColorSimple() {
	return COLOR_CODES[(Math.random() * COLOR_CODES.length) | 0];
}

let lastColor;
export function randomColor(options) {
	const notSame = options && options.notSame;
	const notColor = options && options.notColor;
	const limitWhite = options && options.limitWhite;
	let color = randomColorSimple();

	if (limitWhite && color === COLOR.White && Math.random() < 0.6) {
		color = randomColorSimple();
	}

	if (notSame) {
		while (color === lastColor) {
			color = randomColorSimple();
		}
	} else if (notColor) {
		while (color === notColor) {
			color = randomColorSimple();
		}
	}

	lastColor = color;
	return color;
}

export function whiteOrGold() {
	return Math.random() < 0.5 ? COLOR.Gold : COLOR.White;
}

export function makePistilColor(shellColor) {
	return shellColor === COLOR.White || shellColor === COLOR.Gold ? randomColor({ notColor: shellColor }) : whiteOrGold();
}

// ===== Color Scheme Presets =====

/**
 * Predefined color schemes for different themes
 */
export const COLOR_SCHEMES = {
	// Default - All colors
	default: {
		name: '经典',
		colors: Object.values(COLOR),
		description: '所有颜色随机组合'
	},
	
	// Warm colors (red, gold, purple)
	warm: {
		name: '暖色调',
		colors: [COLOR.Red, COLOR.Gold, COLOR.Purple],
		description: '温暖的红色、金色、紫色'
	},
	
	// Cool colors (blue, green, white)
	cool: {
		name: '冷色调',
		colors: [COLOR.Blue, COLOR.Green, COLOR.White],
		description: '清凉的蓝色、绿色、白色'
	},
	
	// Patriotic (red, white, blue)
	patriotic: {
		name: '爱国',
		colors: [COLOR.Red, COLOR.White, COLOR.Blue],
		description: '红白蓝三色'
	},
	
	// Christmas (red, green, white, gold)
	christmas: {
		name: '圣诞',
		colors: [COLOR.Red, COLOR.Green, COLOR.White, COLOR.Gold],
		description: '圣诞主题配色'
	},
	
	// New Year (gold, white, purple)
	newYear: {
		name: '新年',
		colors: [COLOR.Gold, COLOR.White, COLOR.Purple],
		description: '新年庆典配色'
	},
	
	// Unicorn (purple, blue, white)
	unicorn: {
		name: '独角兽',
		colors: [COLOR.Purple, COLOR.Blue, COLOR.White],
		description: '梦幻紫蓝白'
	},
	
	// Forest (green, white, gold)
	forest: {
		name: '森林',
		colors: [COLOR.Green, COLOR.White, COLOR.Gold],
		description: '自然绿色主题'
	},
	
	// Ocean (blue, white, green)
	ocean: {
		name: '海洋',
		colors: [COLOR.Blue, COLOR.White, COLOR.Green],
		description: '海洋蓝绿色'
	},
	
	// Sunset (red, gold, purple)
	sunset: {
		name: '日落',
		colors: [COLOR.Red, COLOR.Gold, COLOR.Purple],
		description: '日落渐变色'
	},
	
	// Monochrome gold
	gold: {
		name: '金色',
		colors: [COLOR.Gold],
		description: '纯金色烟花'
	},
	
	// Monochrome white
	silver: {
		name: '银色',
		colors: [COLOR.White],
		description: '纯银色烟花'
	},
	
	// Rainbow (all except white)
	rainbow: {
		name: '彩虹',
		colors: [COLOR.Red, COLOR.Gold, COLOR.Green, COLOR.Blue, COLOR.Purple],
		description: '彩虹七色'
	}
};

// Current active color scheme
let activeScheme = 'default';

/**
 * Get current color scheme
 */
export function getActiveColorScheme() {
	return activeScheme;
}

/**
 * Set active color scheme
 * @param {string} schemeName - Name of the scheme
 * @returns {boolean} - Whether the scheme was successfully set
 */
export function setColorScheme(schemeName) {
	if (COLOR_SCHEMES[schemeName]) {
		activeScheme = schemeName;
		return true;
	}
	return false;
}

/**
 * Get random color from active scheme
 */
export function randomColorFromScheme(options = {}) {
	const scheme = COLOR_SCHEMES[activeScheme];
	if (!scheme || scheme.colors.length === 0) {
		return randomColor(options);
	}
	
	const colors = scheme.colors;
	let color = colors[Math.floor(Math.random() * colors.length)];
	
	// Handle notSame option
	if (options.notSame && color === lastColor && colors.length > 1) {
		while (color === lastColor) {
			color = colors[Math.floor(Math.random() * colors.length)];
		}
	}
	
	// Handle notColor option
	if (options.notColor && colors.length > 1) {
		while (color === options.notColor) {
			color = colors[Math.floor(Math.random() * colors.length)];
		}
	}
	
	// Handle limitWhite option
	if (options.limitWhite && color === COLOR.White && colors.length > 1 && Math.random() < 0.6) {
		color = colors[Math.floor(Math.random() * colors.length)];
	}
	
	lastColor = color;
	return color;
}

/**
 * Get list of all available schemes
 */
export function getColorSchemeList() {
	return Object.keys(COLOR_SCHEMES).map(key => ({
		id: key,
		name: COLOR_SCHEMES[key].name,
		description: COLOR_SCHEMES[key].description,
		preview: COLOR_SCHEMES[key].colors
	}));
}

