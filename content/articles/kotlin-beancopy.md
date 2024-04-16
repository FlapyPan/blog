---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-08-16T00:00:00.000Z
update: 2023-09-27T00:00:00.000Z
---

# Kotlin扩展函数封装bean复制方法

封装了两个扩展函数，指定返回值类型即可快速拷贝字段

直接上代码：

```kotlin
/**
 * 扩展 [T].[copy]，指定返回值类型 [R] 即可快速获取对象拷贝
 *
 * 使用方法：val xxxDto: [R] = xxx.copy()
 *
 */
inline fun <T : Any, reified R : Any> T.copy(): R {
    // 获取返回类型的 class
    val clazz = R::class.java
    // 获取构造函数
    val constructor = clazz.declaredConstructors.first()
    // 构建目标对象
    val instance = constructor.newInstance() as R
    // 复制属性 (这里使用的是spring自带的 可以换成其他的工具)
    BeanUtils.copyProperties(this, instance)

    return instance
}

/**
 * 扩展 [T].[copy]，指定返回值类型 [R] 即可快速获取对象拷贝
 *
 * 使用方法：val xxxDto: [R] = xxx.copy { ... }
 *
 */
inline fun <T : Any, reified R : Any> T.copy(after: (R.() -> Unit)): R {
    val instance: R = this.copy()
    instance.after()

    return instance
}
```

测试一下

```kotlin
class Student {
    var id: Int? = null
    var name: String? = null
}

class StudentDto {
    var id: Int? = null
    var name: String? = null
}

fun main() {
    val stu = Student().apply {
        id = 123
        name = "张三"
    }
    // 指定变量类型即可复制
    val stuDto: StudentDto = stu.copy {
        println("复制完成")
        name = "wdnmd"
    }

    println(stuDto.name)
}
```