---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-11-23T13:14:54.731Z
update: 2023-12-02T12:01:48.967Z
---

## 前言

最近闲下来想重拾 rust 的记忆，看了下很久之前写的 [http 服务器](https://github.com/FlapyPan/my-http-server) 项目，完全看不懂了（这真是我写的吗🧐）。

所以花了点时间重新复习了下基础语法，并开了个新坑——今天的主角 rutis。

![](/api/picture/655f49c48b0554b7b7bde1a6)

这次的项目继续使用 [tokio](https://tokio.rs/) ——异步 rust 运行时 来编写，关于 tokio 的用法可以去[官网](https://tokio.rs/tokio/tutorial)查看，这里不做赘述。

## 项目搭建及基础结构

### 新建项目

打开命令行使用 cargo 创建个项目。

```sh
cargo new rutis
cd rutis
```

### 项目结构

基础的项目结构，其他非核心文件不列出，后续有添加会说明。

```text
/rutis
 ├───/src
 |   ├───/bin
 |   |    ├───client.rs  客户端程序入口
 |   |    └───server.rs  服务端程序入口
 |   ├───/client
 |   |    └───mod.rs     客户端相关代码
 |   ├───/server
 |   |    └───mod.rs     服务端相关代码
 |   └───lib.rs          模块配置
 ├───Cargo.toml          项目配置以及依赖
 └───Cargo.lock
```

src/lib.rs

```rust
pub mod server;

pub mod client;

pub type Err = Box<dyn std::error::Error + Send + Sync>;

pub type Res<T> = Result<T, Err>;

```

### 依赖配置

Cargo.toml

```toml
[package]
authors = ["FlapyPan <flapypan@gmail.com>"]
name = "rutis"
version = "0.1.0"
edition = "2021"
# ...其他说明信息

# 服务端入口
[[bin]]
name = "rutis-server"
path = "src/bin/server.rs"

# 客户端入口
[[bin]]
name = "rutis-cli"
path = "src/bin/client.rs"

[dependencies]
clap = { version = "4.4", features = ["derive"] }
log = "0.4"
tokio = { version = "1", features = ["full"] }
tokio-stream = "0.1"
# ...其他依赖
```

### 测试启动

src/bin/server.rs

```rust
/// rutis 服务器主入口
#[tokio::main]
pub async fn main() -> rutis::Res<()> {
    println!("hello rutis server!");
    Ok(())
}
```

启动服务端

```sh
cargo run --bin rutis-server
```

如果配置无误则会在控制台看到输出，确认启动无误后，可以进行下一步的编写。

> 本小节的源码可前往 [FlapyPan/rutis at section-01](https://github.com/FlapyPan/rutis/tree/section-01) 查看。

## 处理命令行参数

编写使用 [clap](https://github.com/clap-rs/clap) 库处理命令行参数。

待续...