---
title: Kotlin 笔记
lastUpdated: 2023-09-27
---

# Kotlin 笔记

![封面](kotlin.png)

## Kotlin 扩展函数封装 bean 复制方法

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

## 在 Kotlin 中使用 SLF4J

### Java 中的 Logger

众所周知，在 Java 中我们可以使用静态属性和静态方法来快速获取当前类的 slf4j 的日志对象

```java
private static final Logger log = LoggerFactory.getLogger(Example.class);
```

### Kotlin 伴生对象获取 Logger

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

### Kotlin 通过委托获取 Logger

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

```kotlin
class Example {
    private val log by LoggerDelegate()

    fun test() {
        log.info("...")
    }
}
```

## Spring Security 使用 JWT 登录认证

使用 Oauth2 Resource Server 的 JWT 进行登录认证

### 配置依赖

```kotlin
implementation("org.springframework.boot:spring-boot-starter-security")
implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
```

### 配置 Spring Security

```kotlin
@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
class SecurityConfig {
    private companion object {
        // 生成随机的 RSA 密钥对用于 jwt 签名，重启服务器旧密钥即失效
        private val keyPair by lazy {
            val generator = KeyPairGenerator.getInstance("RSA")
            // 每次生成的密钥不一样，如果想保证一致，可以在第二个参数添加固定的随机种子
            generator.initialize(2048)
            generator.generateKeyPair()
        }
    }

    /**
     * jwt 生成器
     */
    @Bean
    fun jwtEncoder(): JwtEncoder {
        val key = RSAKey
            .Builder(keyPair.public as RSAPublicKey)
            .privateKey(keyPair.private)
            .build()
        val jwkSet = ImmutableJWKSet<SecurityContext>(JWKSet(key))
        return NimbusJwtEncoder(jwkSet)
    }

    /**
     * jwt 解码器
     */
    @Bean
    fun jwtDecoder(): JwtDecoder = NimbusJwtDecoder
        .withPublicKey(keyPair.public as RSAPublicKey)
        .build()

    /**
     * 密码加解密器
     */
    @Bean
    fun passwordEncoder() = BCryptPasswordEncoder()

    /**
     * 提供认证管理器的 Bean
     */
    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager =
        config.getAuthenticationManager()

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain = with(http) {
        // 关闭 csrf
        csrf { it.disable() }
        // 关闭 session
        sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        // 开启 jwt token 验证
        oauth2ResourceServer { it.jwt {} }
        authorizeHttpRequests {
            it.anyRequest().authenticated()
        }
        // 其他配置...
        http.build()
    }

    // 其他配置和 Bean ...
}
```

### 编写 token 生成接口

```kotlin
@RestController
@RequestMapping("/auth")
class AuthController(
    private val authenticationManager: AuthenticationManager,
    private val jwtEncoder: JwtEncoder
) {

    /**
     * 登录返回 token
     */
    @PostMapping
    fun login(@RequestBody @Validated loginRequest: LoginRequest): RestResult<String?> {
        // 登录认证
        val authToken = UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
        authenticationManager.authenticate(authToken)
        // 生成 token
        val now = Instant.now()
        val claimsSet = JwtClaimsSet.builder() // 设置 token 生成时间
            .issuedAt(now) // 设置 token 过期时间 7 天
            .expiresAt(now.plusSeconds(604800))
            .subject(loginRequest.username)
            // 其他配置
            .build()
        // 返回 token
        return jwtEncoder
            .encode(JwtEncoderParameters.from(claimsSet))
            .tokenValue.restOk()
    }
}

data class LoginRequest(
    val username: String,
    val password: String
)
```
