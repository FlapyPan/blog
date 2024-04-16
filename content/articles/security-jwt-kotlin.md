---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-08-07T00:00:00.000Z
update: 2023-08-13T00:00:00.000Z
---

# Spring Security 使用 JWT 登录认证 (Kotlin)

使用 Oauth2 Resource Server 的 JWT 进行登录认证

## 配置依赖

```kotlin
implementation("org.springframework.boot:spring-boot-starter-security")
implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
```

## 配置 Spring Security

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

## 编写 token 生成接口

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
