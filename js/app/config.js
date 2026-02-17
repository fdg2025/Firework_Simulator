/**
 * Custom Configuration UI Module
 * Provides a settings panel for users to customize firework parameters
 */

import { setColorScheme, getColorSchemeList } from './colors.js';
import { store, appMode } from './state.js';

/**
 * Configuration panel state
 */
let configPanel = null;
let isConfigOpen = false;

/**
 * Initialize configuration UI
 */
export function initConfigUI() {
	createConfigPanel();
	attachEventListeners();
	loadSavedConfig();
}

/**
 * Create configuration panel HTML
 */
function createConfigPanel() {
	const panel = document.createElement('div');
	panel.className = 'config-panel';
	panel.innerHTML = `
		<div class="config-overlay"></div>
		<div class="config-dialog">
			<div class="config-header">
				<h2>⚙️ 自定义配置</h2>
				<button class="config-close-btn" aria-label="关闭">&times;</button>
			</div>
			<div class="config-body">
				<!-- Color Scheme Section -->
				<div class="config-section">
					<h3>🎨 配色方案</h3>
					<div class="config-group">
						<label for="color-scheme">选择配色主题</label>
						<select id="color-scheme" class="config-select">
							${generateColorSchemeOptions()}
						</select>
						<div class="color-preview" id="color-preview"></div>
					</div>
				</div>
				
				<!-- Performance Section -->
				<div class="config-section">
					<h3>⚡ 性能设置</h3>
					<div class="config-group">
						<label for="particle-limit">粒子数量限制</label>
						<input type="range" id="particle-limit" min="500" max="5000" step="100" value="3000">
						<span class="config-value" id="particle-limit-value">3000</span>
					</div>
					<div class="config-group">
						<label for="quality">渲染质量</label>
						<select id="quality" class="config-select">
							<option value="1">低 (省电)</option>
							<option value="2" selected>中 (推荐)</option>
							<option value="3">高 (性能优先)</option>
						</select>
					</div>
				</div>
				
				<!-- Visual Effects Section -->
				<div class="config-section">
					<h3>✨ 视觉效果</h3>
					<div class="config-group">
						<label>
							<input type="checkbox" id="enable-glow" checked>
							启用辉光效果
						</label>
					</div>
					<div class="config-group">
						<label for="glow-intensity">辉光强度</label>
						<input type="range" id="glow-intensity" min="0" max="100" step="5" value="80">
						<span class="config-value" id="glow-intensity-value">80%</span>
					</div>
					<div class="config-group">
						<label for="trail-length">拖尾长度</label>
						<input type="range" id="trail-length" min="1" max="10" step="1" value="3">
						<span class="config-value" id="trail-length-value">3</span>
					</div>
				</div>
				
				<!-- Auto Launch Section -->
				<div class="config-section">
					<h3>🚀 自动发射</h3>
					<div class="config-group">
						<label>
							<input type="checkbox" id="auto-launch-enabled">
							启用自动发射
						</label>
					</div>
					<div class="config-group">
						<label for="launch-frequency">发射频率</label>
						<input type="range" id="launch-frequency" min="500" max="3000" step="100" value="1500">
						<span class="config-value" id="launch-frequency-value">1.5s</span>
					</div>
					<div class="config-group">
						<label for="max-simultaneous">最大同时烟花</label>
						<input type="range" id="max-simultaneous" min="1" max="10" step="1" value="3">
						<span class="config-value" id="max-simultaneous-value">3</span>
					</div>
				</div>
				
				<!-- Audio Section -->
				<div class="config-section">
					<h3>🔊 音频设置</h3>
					<div class="config-group">
						<label for="volume-lift">发射音量</label>
						<input type="range" id="volume-lift" min="0" max="100" step="5" value="70">
						<span class="config-value" id="volume-lift-value">70%</span>
					</div>
					<div class="config-group">
						<label for="volume-burst">爆炸音量</label>
						<input type="range" id="volume-burst" min="0" max="100" step="5" value="50">
						<span class="config-value" id="volume-burst-value">50%</span>
					</div>
				</div>
			</div>
			<div class="config-footer">
				<button class="config-reset-btn">恢复默认</button>
				<button class="config-apply-btn">应用</button>
			</div>
		</div>
	`;
	
	document.body.appendChild(panel);
	configPanel = panel;
	
	updateColorPreview('default');
}

/**
 * Generate color scheme select options
 */
function generateColorSchemeOptions() {
	const schemes = getColorSchemeList();
	return schemes.map(scheme => 
		`<option value="${scheme.id}">${scheme.name} - ${scheme.description}</option>`
	).join('');
}

/**
 * Update color preview
 */
function updateColorPreview(schemeId) {
	const preview = document.getElementById('color-preview');
	if (!preview) return;
	
	const schemes = getColorSchemeList();
	const scheme = schemes.find(s => s.id === schemeId);
	if (!scheme) return;
	
	preview.innerHTML = scheme.preview
		.map(color => `<span class="color-dot" style="background-color: ${color}"></span>`)
		.join('');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
	if (!configPanel) return;
	
	// Close button
	const closeBtn = configPanel.querySelector('.config-close-btn');
	closeBtn.addEventListener('click', closeConfigPanel);
	
	// Overlay click
	const overlay = configPanel.querySelector('.config-overlay');
	overlay.addEventListener('click', closeConfigPanel);
	
	// Color scheme change
	const colorSchemeSelect = document.getElementById('color-scheme');
	colorSchemeSelect.addEventListener('change', (e) => {
		updateColorPreview(e.target.value);
	});
	
	// Range inputs - update value display
	const rangeInputs = configPanel.querySelectorAll('input[type="range"]');
	rangeInputs.forEach(input => {
		const valueDisplay = document.getElementById(`${input.id}-value`);
		input.addEventListener('input', (e) => {
			let value = e.target.value;
			
			// Format value based on input type
			if (input.id === 'launch-frequency') {
				value = (parseInt(value) / 1000).toFixed(1) + 's';
			} else if (input.id.includes('volume') || input.id === 'glow-intensity') {
				value = value + '%';
			}
			
			if (valueDisplay) {
				valueDisplay.textContent = value;
			}
		});
	});
	
	// Apply button
	const applyBtn = configPanel.querySelector('.config-apply-btn');
	applyBtn.addEventListener('click', applyConfig);
	
	// Reset button
	const resetBtn = configPanel.querySelector('.config-reset-btn');
	resetBtn.addEventListener('click', resetConfig);
	
	// Auto-launch enabled checkbox
	const autoLaunchCheckbox = document.getElementById('auto-launch-enabled');
	autoLaunchCheckbox.addEventListener('change', (e) => {
		const frequencyGroup = configPanel.querySelectorAll('.config-section:nth-child(4) .config-group');
		frequencyGroup.forEach((group, index) => {
			if (index > 0) { // Skip the first group (checkbox)
				group.style.opacity = e.target.checked ? '1' : '0.5';
				group.querySelectorAll('input').forEach(input => {
					input.disabled = !e.target.checked;
				});
			}
		});
	});
}

/**
 * Open configuration panel
 */
export function openConfigPanel() {
	if (configPanel) {
		configPanel.classList.add('config-panel--open');
		isConfigOpen = true;
		document.body.style.overflow = 'hidden';
	}
}

/**
 * Close configuration panel
 */
export function closeConfigPanel() {
	if (configPanel) {
		configPanel.classList.remove('config-panel--open');
		isConfigOpen = false;
		document.body.style.overflow = '';
	}
}

/**
 * Toggle configuration panel
 */
export function toggleConfigPanel() {
	if (isConfigOpen) {
		closeConfigPanel();
	} else {
		openConfigPanel();
	}
}

/**
 * Apply configuration
 */
function applyConfig() {
	// Get all values
	const config = {
		colorScheme: document.getElementById('color-scheme').value,
		particleLimit: parseInt(document.getElementById('particle-limit').value),
		quality: parseInt(document.getElementById('quality').value),
		enableGlow: document.getElementById('enable-glow').checked,
		glowIntensity: parseInt(document.getElementById('glow-intensity').value) / 100,
		trailLength: parseInt(document.getElementById('trail-length').value),
		autoLaunchEnabled: document.getElementById('auto-launch-enabled').checked,
		launchFrequency: parseInt(document.getElementById('launch-frequency').value),
		maxSimultaneous: parseInt(document.getElementById('max-simultaneous').value),
		volumeLift: parseInt(document.getElementById('volume-lift').value) / 100,
		volumeBurst: parseInt(document.getElementById('volume-burst').value) / 100,
	};
	
	// Apply color scheme
	setColorScheme(config.colorScheme);
	
	// Save to localStorage
	localStorage.setItem('fireworkConfig', JSON.stringify(config));
	
	// Show feedback
	showConfigFeedback('配置已应用 ✓');
	
	// Close panel
	setTimeout(() => closeConfigPanel(), 500);
}

/**
 * Reset configuration to defaults
 */
function resetConfig() {
	document.getElementById('color-scheme').value = 'default';
	document.getElementById('particle-limit').value = '3000';
	document.getElementById('quality').value = '2';
	document.getElementById('enable-glow').checked = true;
	document.getElementById('glow-intensity').value = '80';
	document.getElementById('trail-length').value = '3';
	document.getElementById('auto-launch-enabled').checked = false;
	document.getElementById('launch-frequency').value = '1500';
	document.getElementById('max-simultaneous').value = '3';
	document.getElementById('volume-lift').value = '70';
	document.getElementById('volume-burst').value = '50';
	
	// Trigger change events to update displays
	configPanel.querySelectorAll('input[type="range"]').forEach(input => {
		input.dispatchEvent(new Event('input'));
	});
	
	updateColorPreview('default');
	showConfigFeedback('已恢复默认设置');
}

/**
 * Load saved configuration
 */
function loadSavedConfig() {
	try {
		const saved = localStorage.getItem('fireworkConfig');
		if (!saved) return;
		
		const config = JSON.parse(saved);
		
		// Apply saved values
		if (config.colorScheme) {
			document.getElementById('color-scheme').value = config.colorScheme;
			setColorScheme(config.colorScheme);
			updateColorPreview(config.colorScheme);
		}
		if (config.particleLimit) document.getElementById('particle-limit').value = config.particleLimit;
		if (config.quality) document.getElementById('quality').value = config.quality;
		if (config.enableGlow !== undefined) document.getElementById('enable-glow').checked = config.enableGlow;
		if (config.glowIntensity !== undefined) document.getElementById('glow-intensity').value = config.glowIntensity * 100;
		if (config.trailLength) document.getElementById('trail-length').value = config.trailLength;
		if (config.autoLaunchEnabled !== undefined) document.getElementById('auto-launch-enabled').checked = config.autoLaunchEnabled;
		if (config.launchFrequency) document.getElementById('launch-frequency').value = config.launchFrequency;
		if (config.maxSimultaneous) document.getElementById('max-simultaneous').value = config.maxSimultaneous;
		if (config.volumeLift !== undefined) document.getElementById('volume-lift').value = config.volumeLift * 100;
		if (config.volumeBurst !== undefined) document.getElementById('volume-burst').value = config.volumeBurst * 100;
		
		// Update value displays
		configPanel.querySelectorAll('input[type="range"]').forEach(input => {
			input.dispatchEvent(new Event('input'));
		});
	} catch (error) {
		console.error('Failed to load saved config:', error);
	}
}

/**
 * Show configuration feedback
 */
function showConfigFeedback(message) {
	const feedback = document.createElement('div');
	feedback.className = 'config-feedback';
	feedback.textContent = message;
	document.body.appendChild(feedback);
	
	requestAnimationFrame(() => {
		feedback.classList.add('config-feedback--show');
	});
	
	setTimeout(() => {
		feedback.classList.remove('config-feedback--show');
		setTimeout(() => feedback.remove(), 300);
	}, 2000);
}

/**
 * Get current configuration
 */
export function getCurrentConfig() {
	try {
		const saved = localStorage.getItem('fireworkConfig');
		return saved ? JSON.parse(saved) : null;
	} catch (error) {
		return null;
	}
}
