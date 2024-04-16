---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-07-31T00:00:00.000Z
update: 2023-07-31T00:00:00.000Z
---

# FFmpeg 常用指令

## 基础用法

```bash
ffmpeg [全局参数] [输入文件参数] -i [输入文件] [输出文件参数] [输出文件]
```

## 完整示例

```bash
ffmpeg -y \
  # 使用qsv硬件解码
  -hwaccel qsv -hwaccel_output_format qsv -init_hw_device qsv=hw \
  -i [input] \
  # 音频编码器
  # libx264 h264_nvenc h264_qsv libx265 hevc_qsv libvpx-vp9 vp9_qsv libaom-av1
  -c:a copy \
  # 视频编码器
  -c:v copy \
  # 质量
  -preset slow\
  # 码率
  -minrate 964K -maxrate 3856K -bufsize 2000K \
  # 720p
  -vf scale=720:-1 \
  # 去除流
  -an -vn \
  [output]
```

## 查看支持的编码器

```bash
ffmpeg -encoders
```

## 查看支持的容器格式(后缀名)

```bash
ffmpeg -formats
```

## 快速转换格式

```bash
# 转换 png 为 webp
ffmpeg -y -i input.png output.webp
# 转换 avi 为 mp4
ffmpeg -y -i input.avi output.mp4
```

## 多个输入合并

```bash
ffmpeg -y -i input.aac -i input.mp4 output.mp4
```

## 截图(从 1:24 开始，每秒一张)

```bash
ffmpeg -y -i input.mp4 -ss 00:01:24 -t 00:00:01 output\_%3d.jpg
```

## 截图(某一帧)

```bash
ffmpeg -ss 01:23:45 -i input.mp4 -vframes 1 \
  # 质量(1-5，1最高质量)
  -q:v 2 \
  output.jpg
```

## 裁剪

```bash
ffmpeg -ss [开始时间] -i [input] -t [持续时间] -c copy [output]
ffmpeg -ss [开始时间] -i [input] -to [结束时间] -c copy [output]
```

## 音频添加图片输出视频

```bash
ffmpeg \
  -loop 1 \
  -i cover.jpg -i input.mp3 \
  -c:v libx264 -c:a aac -b:a 192k -shortest \
  output.mp4
```
