---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-08-01T00:00:00.000Z
update: 2023-08-02T00:00:00.000Z
---

# Go Fiber 使用 JWT 登录验证

## 创建 项目

```bash
mkdir go-fiber-jwt
cd go-fiber-jwt
go mod init go-fiber-jwt
```

## 安装相关依赖

```bash
go get github.com/gofiber/fiber/v2
go get github.com/gofiber/contrib/jwt
```

## 编写 JWT 校验中间件

```go
// jwt.go
package main

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
)

// Protected jwt 校验中间件
func Protected() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey:   jwtware.SigningKey{Key: []byte("JWT密钥")},
		ErrorHandler: jwtError,
	})
}

// jwt 校验错误处理器
func jwtError(c *fiber.Ctx, _ error) error {
	return c.Status(fiber.StatusUnauthorized).SendStren("缺少 JWT 或 JWT 格式错误")
}
```

## 编写登录处理器

```go
// login.go
package main

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Login 登录获取 token
func Login(ctx *fiber.Ctx) error {
	var err error
	loginRequest := LoginRequest{}
	// 获取登录请求体
	err = ctx.BodyParser(&loginRequest)
	if err != nil {
		return err
	}
 
	// TODO 检查用户名密码
	
	// 生成 token 返回
 	jwts := jwt.New(jwt.SigningMethodHS256)
	claims := jwts.Claims.(jwt.MapClaims)
	claims["username"] = loginRequest.Username
	// 过期时间
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	token, err := jwts.SignedString([]byte("JWT密钥"))
	if err != nil {
		return err
	}
	return ctx.SendString(token)
}
```

## 注册中间件和处理器

```go
// main.go
package main

import (
	"github.com/gofiber/fiber/v2"
	"log"
	"time"
)

func main() {
	app := fiber.New()
	// 设置路由
	app.Get("/login", Login)
	// 需要保护的路由添加中间件即可
	app.Get("/hello", Protected(), func(ctx *fiber.Ctx) error {
		return ctx.SendString("hello")
	})
	// 启动
	log.Fatal(app.Listen(":8080"))
}

```

