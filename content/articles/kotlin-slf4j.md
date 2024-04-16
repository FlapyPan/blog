---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-07-30T00:00:00.000Z
update: 2023-07-30T00:00:00.000Z
---

# 在 Kotlin 中使用 SLF4J

> 本文不讨论 lombok

## Java 中的 Logger

众所周知，在 Java 中我们可以使用静态属性和静态方法来快速获取当前类的 slf4j 的日志对象

```java
private static final Logger log = LoggerFactory.getLogger(Example.class);
```

## Kotlin 伴生对象获取 Logger

但是在 kotlin 中是没有静态属性和静态方法这个说法的

我们可以利用 kotlin 的伴生对象来完成类似的功能，但是这样每次都要写很多代码，不够优雅

```kotlin
class Example {
    companion object {
        @JvmStatic
        private val log: Logger = LoggerFactory.getLogger(this::class.java)
    }

    fun test() {
        log.info("...")
    }
}
```

## Kotlin 通过委托获取 Logger

可以利用 kotlin 的委托，并且能把对象创建进行延迟，使用方法也很简单


写一个委托类：

```kotlin
/**
 * slf4j 日志对象获取委托类
 */
class LoggerDelegate : ReadOnlyProperty<Any, Logger> {

    /**
     * 延迟创建的单例日志
     */
    private var _logger: Logger? = null

    /**
     * 获取单例 logger
     */
    override operator fun getValue(thisRef: Any, property: KProperty<*>): Logger {
        if (_logger != null) return _logger!!
        // 获取 logger 对象，由 LoggerFactory 底层保证线程安全
        _logger = LoggerFactory.getLogger(thisRef::class.java)
        return _logger!!
    }
}
```

使用案例：

```kotiin
class Example {
    private val log by LoggerDelegate()

    fun test() {
        log.info("...")
    }
}
```