#!/usr/bin/env node

/**
 * Audio Optimization Script
 * Converts audio files to optimized formats (WebM Opus)
 * 
 * Requirements:
 * - FFmpeg must be installed on your system
 * - Run: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)
 * 
 * Usage:
 * node optimize-audio.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
	inputDir: './audio',
	outputDir: './audio/optimized',
	inputFormat: '.mp3',
	outputFormat: '.webm',
	codec: 'libopus',
	bitrate: '96k', // 96 kbps for good quality
	sampleRate: '48000' // 48 kHz sample rate
};

/**
 * Check if FFmpeg is installed
 */
async function checkFFmpeg() {
	try {
		await execAsync('ffmpeg -version');
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Get all audio files from input directory
 */
async function getAudioFiles() {
	try {
		const files = await fs.readdir(CONFIG.inputDir);
		return files.filter(file => file.endsWith(CONFIG.inputFormat));
	} catch (error) {
		console.error(`Error reading directory: ${error.message}`);
		return [];
	}
}

/**
 * Convert a single audio file
 */
async function convertAudioFile(inputFile) {
	const inputPath = path.join(CONFIG.inputDir, inputFile);
	const outputFile = inputFile.replace(CONFIG.inputFormat, CONFIG.outputFormat);
	const outputPath = path.join(CONFIG.outputDir, outputFile);
	
	const command = `ffmpeg -i "${inputPath}" -c:a ${CONFIG.codec} -b:a ${CONFIG.bitrate} -ar ${CONFIG.sampleRate} -vn "${outputPath}" -y`;
	
	console.log(`Converting: ${inputFile}...`);
	
	try {
		await execAsync(command);
		
		// Get file sizes
		const inputStats = await fs.stat(inputPath);
		const outputStats = await fs.stat(outputPath);
		
		const inputSize = (inputStats.size / 1024).toFixed(2);
		const outputSize = (outputStats.size / 1024).toFixed(2);
		const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
		
		console.log(`✓ ${inputFile} -> ${outputFile}`);
		console.log(`  Input:  ${inputSize} KB`);
		console.log(`  Output: ${outputSize} KB`);
		console.log(`  Saved:  ${savings}%\n`);
		
		return {
			success: true,
			inputFile,
			outputFile,
			inputSize: inputStats.size,
			outputSize: outputStats.size,
			savings: parseFloat(savings)
		};
	} catch (error) {
		console.error(`✗ Failed to convert ${inputFile}: ${error.message}\n`);
		return {
			success: false,
			inputFile,
			error: error.message
		};
	}
}

/**
 * Main function
 */
async function main() {
	console.log('='.repeat(60));
	console.log('Audio Optimization Script');
	console.log('='.repeat(60));
	console.log();
	
	// Check FFmpeg
	console.log('Checking for FFmpeg...');
	const hasFFmpeg = await checkFFmpeg();
	
	if (!hasFFmpeg) {
		console.error('✗ FFmpeg is not installed!');
		console.error('Please install FFmpeg:');
		console.error('  macOS: brew install ffmpeg');
		console.error('  Linux: apt-get install ffmpeg');
		console.error('  Windows: Download from https://ffmpeg.org/download.html');
		process.exit(1);
	}
	
	console.log('✓ FFmpeg is installed\n');
	
	// Create output directory
	try {
		await fs.mkdir(CONFIG.outputDir, { recursive: true });
		console.log(`✓ Output directory ready: ${CONFIG.outputDir}\n`);
	} catch (error) {
		console.error(`✗ Failed to create output directory: ${error.message}`);
		process.exit(1);
	}
	
	// Get audio files
	console.log('Scanning for audio files...');
	const audioFiles = await getAudioFiles();
	
	if (audioFiles.length === 0) {
		console.log('No audio files found in', CONFIG.inputDir);
		process.exit(0);
	}
	
	console.log(`Found ${audioFiles.length} file(s) to convert\n`);
	console.log('='.repeat(60));
	console.log();
	
	// Convert all files
	const results = [];
	for (const file of audioFiles) {
		const result = await convertAudioFile(file);
		results.push(result);
	}
	
	// Summary
	console.log('='.repeat(60));
	console.log('Summary');
	console.log('='.repeat(60));
	
	const successful = results.filter(r => r.success);
	const failed = results.filter(r => !r.success);
	
	if (successful.length > 0) {
		const totalInputSize = successful.reduce((sum, r) => sum + r.inputSize, 0);
		const totalOutputSize = successful.reduce((sum, r) => sum + r.outputSize, 0);
		const totalSavings = ((1 - totalOutputSize / totalInputSize) * 100).toFixed(1);
		
		console.log(`✓ Converted: ${successful.length} file(s)`);
		console.log(`  Total input size:  ${(totalInputSize / 1024).toFixed(2)} KB`);
		console.log(`  Total output size: ${(totalOutputSize / 1024).toFixed(2)} KB`);
		console.log(`  Total savings:     ${totalSavings}%`);
	}
	
	if (failed.length > 0) {
		console.log(`\n✗ Failed: ${failed.length} file(s)`);
		failed.forEach(r => console.log(`  - ${r.inputFile}`));
	}
	
	console.log('\n' + '='.repeat(60));
	console.log('Done!');
	console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
	main().catch(error => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

module.exports = { main, convertAudioFile };
