import { MyMath } from "../MyMath.js";

export const randomWords = ["新年快乐", "2026", "万事如意", "平安喜乐", "马到成功"];

const wordDotsCache = new Map();
const WORD_DOTS_CACHE_MAX = 40;
const WORD_FONT_STEP = 6;

export function randomWord() {
	if (randomWords.length === 0) return "";
	if (randomWords.length === 1) return randomWords[0];
	return randomWords[(Math.random() * randomWords.length) | 0];
}

export function getWordDots(word) {
	if (!word) return null;
	let fontSize = Math.floor(Math.random() * 70 + 60);
	fontSize = Math.round(fontSize / WORD_FONT_STEP) * WORD_FONT_STEP;
	const cacheKey = `${word}|${fontSize}`;
	if (wordDotsCache.has(cacheKey)) {
		return wordDotsCache.get(cacheKey);
	}

	const res = MyMath.literalLattice(word, 3, "bold sans-serif", fontSize + "px");
	wordDotsCache.set(cacheKey, res);
	if (wordDotsCache.size > WORD_DOTS_CACHE_MAX) {
		const oldestKey = wordDotsCache.keys().next().value;
		wordDotsCache.delete(oldestKey);
	}

	return res;
}
