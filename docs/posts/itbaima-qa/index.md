---
title: 栢码项目面经
description: 收集了栢码群里面用栢码项目相关的面经
lastUpdated: 2024-03-27
---

# 栢码项目面经

![封面](cover.png)

收集了栢码群里面用栢码项目相关的面经。

## 介绍一下 Jwt，为什么用 jwt，对比 session 方案的好处和坏处

jwt 的优点：

- 可扩展性好。应用程序分布式部署的情况下，session 需要做多机数据共享，通常可以存在数据库或者 redis 里面。而 jwt 不需要。
- 无状态。jwt 不在服务端存储任何状态。jwt 的载荷中可以存储一些常用信息，用于交换信息，有效地使用 JWT，可以降低服务器查询数据库的次数。

jwt 的缺点：

- 安全性。由于 jwt 的 payload 是使用 base64 编码的，并没有加密，因此 jwt 中不能存储敏感数据。而 session 的信息是存在服务端的，相对来说更安全。

- 性能。由于是无状态使用 JWT，所有的数据都被放到 JWT 里，如果还要进行一些数据交换，那载荷会更大，经过编码之后导致 jwt 非常长，cookie 的限制大小一般是 4k，cookie 很可能放不下，所以 jwt 一般放在 local storage 里面。并且用户在系统中的每一次 http 请求都会把 jwt 携带在 Header 里面，http 请求的 Header 可能比 Body 还要大。而 sessionId 只是很短的一个字符串，因此使用 jwt 的 http 请求比使用 session 的开销大得多。

- 一次性。无状态是 jwt 的特点，但也导致了这个问题，jwt 是一次性的。想修改里面的内容，就必须签发一个新的 jwt。

- 无法废弃。一旦签发一个 jwt，在到期之前就会始终有效，无法中途废弃。例如你在 payload 中存储了一些信息，当信息需要更新时，则重新签发一个 jwt，但是由于旧的 jwt 还没过期，拿着这个旧的 jwt 依旧可以登录，那登录后服务端从 jwt 中拿到的信息就是过时的。为了解决这个问题，我们就需要在服务端部署额外的逻辑，例如设置一个黑名单，一旦签发了新的 jwt，那么旧的就加入黑名单（比如存到 redis 里面），避免被再次使用。

- 续签。传统的 cookie 续签方案一般都是框架自带的，session 有效期 30 分钟，30 分钟内如果有访问，有效期被刷新至 30 分钟。一样的道理，要改变 jwt 的有效时间，就要签发新的 jwt。最简单的一种方式是每次请求刷新 jwt，即每个 http 请求都返回一个新的 jwt。这个方法不仅暴力不优雅，而且每次请求都要做 jwt 的加密解密，会带来性能问题。另一种方法是在 redis 中单独为每个 jwt 设置过期时间，每次访问时刷新 jwt 的过期时间。

> JWT 参考：<https://www.itbaima.cn/document/wci9lb9tgea866jt>

## 你的项目用了 spring boot 3，相对 2 有什么不同 (提到了 swagger 不适配?)

spring boot 3 和 spring boot 2 的部分区别：

1. 最低环境。SpringBoot2 的最低版本要求为 Java8，支持 Java9；而 SpringBoot3 决定使用 Java17 作为最低版本，并支持 Java19。Spring Boot2 基于 Spring Framework5 开发；而 SpringBoot3 构建基于 Spring Framework6 之上，需要使用 Spring Framework6。

2. GraalVM 支持。相比 SpringBoot2，SpringBoot3 的 Spring Native 也是升级的一个重大特性，支持使用 GraalVM 将 Spring 的应用程序编译成本地可执行的镜像文件，可以显著提升启动速度、峰值性能以及减少内存使用。

   > GraalVm 配置参考：<https://www.itbaima.cn/space/project/deploy/8>

3. 图片 Banner。在 SpringBoot2 中，自定义 Banner 支持图片类型；而现在 Spring Boot3 自定义 Banner 只支持文本类型（banner.txt），不再支持图片类型。

4. 依赖项。删除了对一些附加依赖项的支持，包括 Apache ActiveMQ、Atomikos、EhCache2 和 HazelCast3。

5. Java EE 已经变更为 Jakarta EE（javax.servlet.Filter 要改为 jakarta.servlet.Filter）。

swagger 问题：

- 使用 springdoc (<https://springdoc.org/>)。
- 使用 springfox (<http://springfox.io/>)

## Spring security 你是如何配置的，filter 是怎么编写的

新版 security 配置全面采用了 lambda 表达式来配置，例子：

```java
@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
        http.formLogin(formLogin -> formLogin
                .loginProcessingUrl("/auth/login")
                .successHandler((request, response, authentication) -> {})
                .failureHandler((request, response, authentication) -> {}));
        http.logout(logout -> logout
                .logoutUrl("/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {}));
        http.authorizeHttpRequests(request -> request
                .requestMatchers("/auth/**")
                .permitAll()
                .anyRequest()
                .authenticated()
        );

        return http.build();
    }
```

> 可参考：<https://www.itbaima.cn/document/wci9lb9tgea866jt>

## 为什么用 RabbitMQ 而不创建多个线程

任何 MQ 相关的问题，优先想到“异步”、“解耦”。

1. 提高系统稳定性，系统 down 了，消息是在外部的不会丢失。
2. 线程会占用资源，消息队列就可以把发短信的操作放到其他机器。
3. 架构思想，应用服务尽量只做逻辑，数据放外部。

> 可参考：<https://www.itbaima.cn/document/a782u84512tyuo1m>

## 为什么要编写工具转换 DTO 和 VO，相比 BeanUtils.copyProperties 有优势吗，运用反射是不是效率比较低

（表达意思：我会玩反射）

BeanUtils.copyProperties 底层也是反射，但 spring 做了大量逻辑优化和缓存优化，性能不会很低。

> 反射参考：<https://www.itbaima.cn/document/lfqtvxr7azumcwja>

## 介绍一下限流工具类的功能，redis 的键值分别是什么，redis 中用什么数据结构储存黑名单，假如有几十万个 ip 请求，都要记录在 redis 吗，是不是太消耗资源

限流工具类的功能：限流（难道还有其他功能？）

限流工具类 的 redis 的键值分别是什么：key 是 ip 地址，value 是访问次数

ip 黑名单存储结构：字符串（简单高效！）

几十万个 ip 请求：这个量 redis 完全存的下，如果占用太高可以考虑转为无符号整型

> 栢码视频：<https://www.bilibili.com/video/BV1Pz4y1W7TN/?p=21>
>
> redis 参考：<https://www.itbaima.cn/document/35v1hbsfcdgagdnw>

## Redis 集群有搭建过吗

> 栢码视频：<https://www.bilibili.com/video/BV1AL4y1j7RY?p=46>

## Minio 如何实现文件的存取

Minio 的主要特点：

- 简单易用：Minio 的安装和配置非常简单，只需要下载并运行相应的二进制文件即可。它提供- 了一个 Web UI,可以通过界面管理存储桶和对象。

- 可扩展性：Minio 可以轻松地扩展到多个节点，以提供高可用性和容错能力。它支持多种部署- 模式，包括单节点、主从复制和集群等。

- 高可用性：Minio 提供了多种机制来保证数据的可靠性和可用性，包括冗余备份、数据复制和- 故障转移等。

- 安全性：Minio 提供了多种安全机制来保护数据的机密性和完整性，包括 SSL/TLS 加密、- 访问控制和数据加密等。

- 多语言支持：Minio 支持多种编程语言，包括 Java、Python、Ruby 和 Go 等。

- 社区支持：Minio 是一个开源项目，拥有庞大的社区支持和贡献者。它的源代码可以在 - GitHub 上获得，并且有一个活跃的邮件列表和论坛。

- 对象存储：Minio 的核心功能是对象存储。它允许用户上传和下载任意数量和大小的对象，并- 提供了多种 API 和 SDK 来访问这些对象。

- 块存储：Minio 还支持块存储，允许用户上传和下载大型文件(例如图像或视频)。块存储是一- 种快速、高效的方式来处理大型文件。

- 文件存储：Minio 还支持文件存储，允许用户上传和下载单个文件。文件存储是一种简单、快速的方式来处理小型文件。

使用 minio 官方提供的 Java SDK 进行操作。

> Minio 官方文档：<https://min.io/docs/minio/linux/developers/java/minio-java.html>

## 介绍一下雪花 ID 的算法，假如要你实现一个全球唯一的 id 你会怎么做

雪花算法是一种分布式 ID 生成方案，它可以生成一个长度为 64 位的唯一 ID，其中包含了时间戳、数据中心 ID 和机器 ID 等信息。

雪花算法的核心思想是利用时间戳和机器 ID 生成一个唯一的序列号，从而保证生成的 ID 的唯一性。

雪花算法的优点包括唯一性、时间戳有序和高性能，缺点包括依赖时钟和数据中心 ID 和机器 ID 需要手动分配。

全球唯一 ID 目前有两种方案：

1. 基于时间的：能基本保证全球唯一性，但是使用了 Mac 地址，会暴露 Mac 地址和生成时间。

2. 分布式的：能保证全球唯一性，但是常用库基本没有实现。

具体可参考 <https://www.developers.pub/article/606>

## 项目里“楼中楼”评论是如何做的？

每条评论加一个类似`parentId`和`replyId`字段。

1. 直接发表评论，则`parentId`和`replyId`都为空
2. 对一级评论回复，则`parentId`和`replyId`都为一级评论的`id`
3. 楼中楼进行回复，`parentId`为一级评论的`id`，`replyId`为回复的评论的`id`

## 如何统计一天之内登录过的人数？

两种基于 Redis 的方案：

### 基于 BitSet

用户登录时，使用`setbit`命令记录用户已登录。

例子：

```text
setbit login:<日期> <用户id> 1
```

然后使用`bitcount`统计今日的数量。

例子：

```text
bitcount login:<日期>
```

**注意点：** 统计的时间复杂度为 O(N) ，当进行大数据量的统计时，最好将任务指派到附属节点(slave)进行，避免阻塞主节点。

**优点：** 精准统计，基本上是秒出结果，能方便地获取统计对象的状态。

**缺点：** 数量十分巨大时，空间占用会比较，可以通过分片，或者压缩等手段去解决。

### 基于 HyperLogLog

用户登录时，使用`pfadd`命令记录用户已登录。

例子：

```text
pffadd login_<日期> <用户id>
```

然后使用`pfcount`统计今日的数量。

例子：

```text
pfcount login_<日期>
```

**注意点：** key 不能用:分隔，可使用_代替

**优点：** 可以统计海量数量，并且占用内存很小。

**缺点：** 牺牲了准确率，而且无法得到每个统计对象的状态。

> Bitmap 存储一亿数据需要 12M，而 HyperLogLog 只需要 14K。

## 说一说 MySQL 索引

> 栢码视频：<https://www.bilibili.com/video/BV19d4y147Df/?p=20>

## java 内存模型了解过吗

> 参考：<https://pdai.tech/md/java/jvm/java-jvm-jmm.html>

## JVM 堆栈内存（什么是虚拟机栈）

每个线程都有自己的一个虚拟机栈，虚拟机栈保存着方法的局部变量、部分结果，并参与方法的调用和返回，生命周期和所属的线程一致。每个虚拟机栈中都有一个个的栈帧(Stack Frame)，每个栈帧对应一次方法调用。

栢码视频：<https://www.bilibili.com/video/BV1Er4y1r7as?p=8>

## 堆栈内存相关的异常

如果线程请求分配的栈容量超过允许的最大容量，将会抛出`StackOverflowError`异常。

如果 Java 虚拟机栈可以动态扩展，并且在尝试扩展的时候无法申请到足够的内存，或者在创建新的线程时没有足够的内存去创建对应的虚拟机栈，将会抛出一个`OutOfMemoryError`异常。

> 栢码视频：<https://www.bilibili.com/video/BV1Er4y1r7as?p=10>

## Java 并发，多线程知道吗？

> 栢码视频：<https://www.bilibili.com/video/BV1YP4y1o75f?p=118>

## synchronized 实现原理了解吗？锁升级？乐观锁？

> 栢码视频：<https://www.bilibili.com/video/BV1JT4y1S7K8?p=3>

## 线程池的拒绝策略都有什么？

> 栢码视频：<https://www.bilibili.com/video/BV1JT4y1S7K8?p=26>

## Spring 的扩展你有了解过吗？有没有自己编写过 starter？

> 栢码视频：<https://www.bilibili.com/video/BV1xu4y1m7UP?p=20>

## Spring的事务传播特性

> 栢码视频：<https://www.bilibili.com/video/BV1Kv4y1x7is?p=24>

---

**以下内容施工中**

---

## Redis过期了任务还没执行完怎么办？

写在消息队列里面异步更新redis

## 查询一个不是主键的索引，需要回表几次？

## 慢查询是什么？如何查询？

开启MySQL慢查询日志、explain关键字

## 主从复制原理知道吗？

## 项目里的客户端都采集服务器的什么信息了？

## Spring的事务传播特性?

## Spring的事务你用过吗？

## 那@Transactional的原理呢？

## 什么情况会导致事务的失效？

## 你项目里是如何保证Redis和数据库的最终一致性的？

## Redis持久化你项目里用了吗？

## 说一下RabbitMQ里面的角色吧？

## 如何保证消息不丢失？

## 消息积压怎么办？

## 你简历里项目是怎么部署到服务器的？（docker镜像）
