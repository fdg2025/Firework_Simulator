/**
 * Share Module
 * Provides screenshot and recording capabilities
 */

/**
 * Share panel state
 */
let sharePanel = null;
let isShareOpen = false;
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];

/**
 * Initialize share UI
 */
export function initShareUI() {
	createSharePanel();
	attachEventListeners();
}

/**
 * Create share panel HTML
 */
function createSharePanel() {
	const panel = document.createElement('div');
	panel.className = 'share-panel';
	panel.innerHTML = `
		<div class="share-overlay"></div>
		<div class="share-dialog">
			<div class="share-header">
				<h2>📸 分享烟花</h2>
				<button class="share-close-btn" aria-label="关闭">&times;</button>
			</div>
			<div class="share-body">
				<div class="share-preview" id="share-preview">
					<canvas id="preview-canvas"></canvas>
				</div>
				<div class="share-actions">
					<button class="share-btn share-btn--screenshot" id="btn-screenshot">
						<span class="share-btn__icon">📷</span>
						<span class="share-btn__text">截图</span>
					</button>
					<button class="share-btn share-btn--record" id="btn-record">
						<span class="share-btn__icon">🎬</span>
						<span class="share-btn__text">录制 (3秒)</span>
					</button>
					<button class="share-btn share-btn--download" id="btn-download" disabled>
						<span class="share-btn__icon">💾</span>
						<span class="share-btn__text">下载</span>
					</button>
				</div>
				<div class="share-info">
					<p>提示：在分享之前，请先截图或录制一段烟花动画</p>
				</div>
			</div>
		</div>
	`;
	
	document.body.appendChild(panel);
	sharePanel = panel;
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
	if (!sharePanel) return;
	
	// Close button
	const closeBtn = sharePanel.querySelector('.share-close-btn');
	closeBtn.addEventListener('click', closeSharePanel);
	
	// Overlay click
	const overlay = sharePanel.querySelector('.share-overlay');
	overlay.addEventListener('click', closeSharePanel);
	
	// Screenshot button
	const screenshotBtn = document.getElementById('btn-screenshot');
	screenshotBtn.addEventListener('click', captureScreenshot);
	
	// Record button
	const recordBtn = document.getElementById('btn-record');
	recordBtn.addEventListener('click', toggleRecording);
	
	// Download button
	const downloadBtn = document.getElementById('btn-download');
	downloadBtn.addEventListener('click', downloadCapture);
}

/**
 * Open share panel
 */
export function openSharePanel() {
	if (sharePanel) {
		sharePanel.classList.add('share-panel--open');
		isShareOpen = true;
		document.body.style.overflow = 'hidden';
		updatePreview();
	}
}

/**
 * Close share panel
 */
export function closeSharePanel() {
	if (sharePanel) {
		sharePanel.classList.remove('share-panel--open');
		isShareOpen = false;
		document.body.style.overflow = '';
		
		// Stop recording if active
		if (isRecording) {
			stopRecording();
		}
	}
}

/**
 * Toggle share panel
 */
export function toggleSharePanel() {
	if (isShareOpen) {
		closeSharePanel();
	} else {
		openSharePanel();
	}
}

/**
 * Update preview canvas
 */
function updatePreview() {
	const mainCanvas = document.getElementById('main-canvas');
	const previewCanvas = document.getElementById('preview-canvas');
	
	if (!mainCanvas || !previewCanvas) return;
	
	const ctx = previewCanvas.getContext('2d');
	previewCanvas.width = mainCanvas.width;
	previewCanvas.height = mainCanvas.height;
	
	ctx.drawImage(mainCanvas, 0, 0);
}

/**
 * Capture screenshot
 */
function captureScreenshot() {
	const mainCanvas = document.getElementById('main-canvas');
	const trailsCanvas = document.getElementById('trails-canvas');
	
	if (!mainCanvas || !trailsCanvas) {
		showShareFeedback('无法获取画布', 'error');
		return;
	}
	
	// Create a temporary canvas to combine both layers
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = mainCanvas.width;
	tempCanvas.height = mainCanvas.height;
	const ctx = tempCanvas.getContext('2d');
	
	// Draw trails layer first (background)
	ctx.drawImage(trailsCanvas, 0, 0);
	// Draw main layer on top
	ctx.drawImage(mainCanvas, 0, 0);
	
	// Update preview
	const previewCanvas = document.getElementById('preview-canvas');
	const previewCtx = previewCanvas.getContext('2d');
	previewCanvas.width = tempCanvas.width;
	previewCanvas.height = tempCanvas.height;
	previewCtx.drawImage(tempCanvas, 0, 0);
	
	// Store the canvas for downloading
	sharePanel.dataset.captureType = 'screenshot';
	sharePanel.dataset.captureData = tempCanvas.toDataURL('image/png');
	
	// Enable download button
	document.getElementById('btn-download').disabled = false;
	
	showShareFeedback('截图成功 ✓');
}

/**
 * Toggle recording
 */
function toggleRecording() {
	if (isRecording) {
		stopRecording();
	} else {
		startRecording();
	}
}

/**
 * Start recording
 */
function startRecording() {
	const mainCanvas = document.getElementById('main-canvas');
	const trailsCanvas = document.getElementById('trails-canvas');
	
	if (!mainCanvas || !trailsCanvas) {
		showShareFeedback('无法获取画布', 'error');
		return;
	}
	
	// Create a temporary canvas to combine both layers
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = mainCanvas.width;
	tempCanvas.height = mainCanvas.height;
	const ctx = tempCanvas.getContext('2d');
	
	// Function to update combined canvas
	const updateCanvas = () => {
		if (!isRecording) return;
		
		// Clear and redraw
		ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		ctx.drawImage(trailsCanvas, 0, 0);
		ctx.drawImage(mainCanvas, 0, 0);
		
		requestAnimationFrame(updateCanvas);
	};
	updateCanvas();
	
	try {
		const stream = tempCanvas.captureStream(30); // 30 FPS
		mediaRecorder = new MediaRecorder(stream, {
			mimeType: 'video/webm;codecs=vp9',
			videoBitsPerSecond: 2500000 // 2.5 Mbps
		});
		
		recordedChunks = [];
		
		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				recordedChunks.push(event.data);
			}
		};
		
		mediaRecorder.onstop = () => {
			const blob = new Blob(recordedChunks, { type: 'video/webm' });
			const url = URL.createObjectURL(blob);
			
			// Update preview with video
			const previewContainer = document.getElementById('share-preview');
			previewContainer.innerHTML = `
				<video controls autoplay loop style="width: 100%; height: 100%; object-fit: contain;">
					<source src="${url}" type="video/webm">
				</video>
			`;
			
			// Store the blob for downloading
			sharePanel.dataset.captureType = 'video';
			sharePanel.dataset.captureData = url;
			
			// Enable download button
			document.getElementById('btn-download').disabled = false;
			
			showShareFeedback('录制完成 ✓');
		};
		
		mediaRecorder.start();
		isRecording = true;
		
		// Update button
		const recordBtn = document.getElementById('btn-record');
		recordBtn.innerHTML = `
			<span class="share-btn__icon">⏹️</span>
			<span class="share-btn__text">停止录制</span>
		`;
		recordBtn.classList.add('share-btn--recording');
		
		showShareFeedback('开始录制...');
		
		// Auto-stop after 3 seconds
		setTimeout(() => {
			if (isRecording) {
				stopRecording();
			}
		}, 3000);
		
	} catch (error) {
		console.error('Recording failed:', error);
		showShareFeedback('录制失败: ' + error.message, 'error');
		isRecording = false;
	}
}

/**
 * Stop recording
 */
function stopRecording() {
	if (mediaRecorder && mediaRecorder.state !== 'inactive') {
		mediaRecorder.stop();
	}
	
	isRecording = false;
	
	// Reset button
	const recordBtn = document.getElementById('btn-record');
	recordBtn.innerHTML = `
		<span class="share-btn__icon">🎬</span>
		<span class="share-btn__text">录制 (3秒)</span>
	`;
	recordBtn.classList.remove('share-btn--recording');
}

/**
 * Download captured content
 */
function downloadCapture() {
	const captureType = sharePanel.dataset.captureType;
	const captureData = sharePanel.dataset.captureData;
	
	if (!captureType || !captureData) {
		showShareFeedback('没有可下载的内容', 'error');
		return;
	}
	
	const link = document.createElement('a');
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
	
	if (captureType === 'screenshot') {
		link.download = `firework-${timestamp}.png`;
		link.href = captureData;
	} else if (captureType === 'video') {
		link.download = `firework-${timestamp}.webm`;
		link.href = captureData;
	}
	
	link.click();
	showShareFeedback('下载开始 ✓');
}

/**
 * Show share feedback
 */
function showShareFeedback(message, type = 'success') {
	const feedback = document.createElement('div');
	feedback.className = `share-feedback share-feedback--${type}`;
	feedback.textContent = message;
	document.body.appendChild(feedback);
	
	requestAnimationFrame(() => {
		feedback.classList.add('share-feedback--show');
	});
	
	setTimeout(() => {
		feedback.classList.remove('share-feedback--show');
		setTimeout(() => feedback.remove(), 300);
	}, 2000);
}
