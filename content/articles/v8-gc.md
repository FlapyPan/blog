---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2024-01-20T10:25:42.389Z
update: 2024-03-03T06:57:37.939Z
---

**持续更新中...**

今天来聊一聊 Chromium 和 Node.js 的 V8 引擎中的 GC (Garbage Collector) 引擎。

## 分代结构

在 V8 中，堆空间会被分成两块区域，或者叫代(generation)，分别叫做新生代(young generation)和老年代(old generation)，而新生代由分为托儿所(nursery)和中间代(intermediate)。

![](/api/picture/65ac7708b559620f6775b556)

## GC 流程

### Minor GC (Scavenger)

Minor GC 主要针对新生代进行垃圾回收。在这个过程中，主要有三个步骤：移动对象、清空托儿所和角色互换。

#### 移动对象

在 Minor GC 过程中，V8 会检查新生代中的对象，将存活的对象移动到中间代或老年代。这样可以确保新生代中的空间得到充分利用，同时减少内存碎片。

如果对象是第一次被移动，会移动到中间带，并打上标记，在下一次移动时，被标记的对象会被直接移动到老年代。

#### 清空托儿所

在移动存活对象之后，V8 会清空托儿所，将其内存空间归还给操作系统。这样一来，新生代中的空间就可以重新分配给新创建的对象。

#### 角色互换

清空托儿所后，中间代和托儿所的角色会发生互换，原先的中间代会变成托儿所，托儿所会变成中间代。

### Major GC (Mark Sweep & Mark Compack)

Major GC 主要针对老年代进行垃圾回收。这个过程主要包括三个步骤：GC ROOT、并发标记和并发清除与整理。

#### GC ROOT

在 Major GC 开始时，V8 会首先确定一组根对象（GC ROOT），这些对象是不会被垃圾回收的。通过遍历这些根对象，V8 可以找出所有与之相关的存活对象。

#### 并发标记

在这个阶段，V8 会并行地遍历整个堆空间，标记出所有存活的对象。这个过程可以在 JavaScript 执行过程中并发进行，从而降低垃圾回收对应用程序性能的影响。

#### 并发清除和整理

最后，V8 会清除那些没有被标记为存活的对象，并整理堆空间。这样可以确保内存空间得到充分利用，同时减少内存碎片。