# 音频优化指南

## 概述

此脚本将音频文件从 MP3 格式转换为 WebM Opus 格式，可减小 30-40% 的文件大小，同时保持良好的音质。

## 安装依赖

### 1. 安装 FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
从 [FFmpeg 官网](https://ffmpeg.org/download.html) 下载并安装

### 2. 验证安装

```bash
ffmpeg -version
```

## 使用方法

### 自动转换所有音频文件

```bash
cd Firework_Simulator
node scripts/optimize-audio.js
```

脚本会：
1. 扫描 `audio/` 目录中的所有 MP3 文件
2. 将它们转换为 WebM Opus 格式
3. 将优化后的文件保存到 `audio/optimized/` 目录
4. 显示每个文件的大小对比和节省百分比

### 手动转换单个文件

如果你想手动转换特定文件：

```bash
ffmpeg -i input.mp3 -c:a libopus -b:a 96k -ar 48000 -vn output.webm
```

参数说明：
- `-c:a libopus`: 使用 Opus 编码器
- `-b:a 96k`: 比特率 96 kbps
- `-ar 48000`: 采样率 48 kHz
- `-vn`: 不包含视频

## 输出示例

```
============================================================
Audio Optimization Script
============================================================

Checking for FFmpeg...
✓ FFmpeg is installed

✓ Output directory ready: ./audio/optimized

Scanning for audio files...
Found 9 file(s) to convert

============================================================

Converting: burst1.mp3...
✓ burst1.mp3 -> burst1.webm
  Input:  23.45 KB
  Output: 14.87 KB
  Saved:  36.6%

Converting: burst2.mp3...
✓ burst2.mp3 -> burst2.webm
  Input:  25.12 KB
  Output: 15.34 KB
  Saved:  38.9%

...

============================================================
Summary
============================================================
✓ Converted: 9 file(s)
  Total input size:  220.45 KB
  Total output size: 135.78 KB
  Total savings:     38.4%

============================================================
Done!
============================================================
```

## 更新代码

转换完成后，需要更新代码以使用新的音频格式：

### 1. 替换音频文件

```bash
# 备份原文件
mv audio audio_backup

# 使用优化后的文件
mv audio/optimized audio
```

### 2. 更新 audio.js

将文件扩展名从 `.mp3` 改为 `.webm`：

```javascript
// 之前
const sounds = {
  lift: ['lift1.mp3', 'lift2.mp3', 'lift3.mp3'],
  burst: ['burst1.mp3', 'burst2.mp3'],
  // ...
};

// 之后
const sounds = {
  lift: ['lift1.webm', 'lift2.webm', 'lift3.webm'],
  burst: ['burst1.webm', 'burst2.webm'],
  // ...
};
```

### 3. 更新 Service Worker

更新 `sw.js` 中的预缓存文件列表：

```javascript
const PRECACHE_ASSETS = [
  // ...
  './audio/burst1.webm',
  './audio/burst2.webm',
  // ...
];
```

## 音质对比

- **MP3 @ 128 kbps**: 文件较大，兼容性好
- **Opus @ 96 kbps**: 文件小 30-40%，音质相当于 MP3 128 kbps

## 浏览器兼容性

WebM Opus 支持：
- ✅ Chrome 25+
- ✅ Firefox 15+
- ✅ Edge 14+
- ✅ Safari 14.1+
- ✅ Opera 12+

几乎所有现代浏览器都支持 WebM Opus 格式。

## 故障排除

### FFmpeg 未找到

确保 FFmpeg 在系统 PATH 中：

```bash
which ffmpeg  # macOS/Linux
where ffmpeg  # Windows
```

### 权限错误

确保脚本有执行权限：

```bash
chmod +x scripts/optimize-audio.js
```

### 内存不足

如果音频文件很大，可能需要降低比特率：

```bash
# 修改 optimize-audio.js 中的 CONFIG.bitrate
bitrate: '64k'  // 降低到 64 kbps
```

## 高级选项

### 自定义比特率

编辑 `scripts/optimize-audio.js`：

```javascript
const CONFIG = {
  bitrate: '128k', // 更高质量，文件更大
  // 或
  bitrate: '64k',  // 更小文件，质量稍低
};
```

### 批量命名

如果需要保持原文件名不变：

```javascript
const outputFile = inputFile; // 不改变文件名
```

## 性能影响

转换后的预期改进：
- **文件大小**: 减少 30-40%
- **加载时间**: 减少 30-40%
- **带宽使用**: 减少 30-40%
- **音质**: 几乎无损（Opus 编码效率极高）

## 总结

音频优化是提升网页性能的重要一步。通过减小音频文件大小，可以：
- 加快页面加载速度
- 减少带宽消耗
- 改善用户体验
- 降低服务器成本

建议在生产环境中使用优化后的 WebM Opus 格式。
