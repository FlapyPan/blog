---
title: Go 语言笔记
lastUpdated: 2023-08-02
---

# Go 语言笔记

![封面](go.png)

## Fiber 使用 JWT 登录验证

### 创建 项目

```bash
mkdir go-fiber-jwt
cd go-fiber-jwt
go mod init go-fiber-jwt
```

### 安装相关依赖

```bash
go get github.com/gofiber/fiber/v2
go get github.com/gofiber/contrib/jwt
```

### 编写 JWT 校验中间件

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

### 编写登录处理器

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

### 注册中间件和处理器

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

## 操作 Minio

Minio 官方提供了 Go 的 SDK，可以使用下列指令安装：

```sh
go get github.com/minio/minio-go/v7
```

并且提供了对应的文档：<https://min.io/docs/minio/linux/developers/go/API.html>

### Go SDK 基本使用

初始化上下文和客户端：

```go
package main

import (
	"context"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func main() {
	// 创建一个上下文，用于超时和取消等操作的处理，这里直接使用默认的实现
	ctx := context.Background()
	// 创建 minio 客户端
	endpoint := "127.0.1:9000"
	id := "admin"
	secret := "adminadmin"
	SessionToken := ""
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(id, secret, SessionToken),
	})
	if err != nil {
		log.Fatalln(err)
	}
	// ...
}
```

上传文件：

```go
func main() {
	// ...
	// 上传本地文件
	bucketName := "test"
	objectName := "123.jpg"
	filePath := "test.jpg"
	info, err := minioClient.FPutObject(ctx, bucketName, objectName, filePath, minio.PutObjectOptions{})
	if err != nil {
		log.Fatalln(err)
	}
	// 输出上传文件信息
	log.Printf("上传完成\n%#v", info)
}
```

下载文件：

```go
func main() {
	// ...
	// 下载文件到本地
	bucketName := "test"
	objectName := "123.jpg"
	filePath := "456.jpg"
	err = minioClient.FGetObject(ctx, bucketName, objectName, filePath, minio.GetObjectOptions{})
	if err != nil {
		log.Fatalln(err)
	}
}
```

删除文件：

```go
func main() {
	// ...
	// 删除文件
	bucketName := "test"
	objectName := "123.jpg"
	err = minioClient.RemoveObject(ctx, bucketName, objectName, minio.RemoveObjectOptions{})
}
```

### 使用 Gin 框架进行服务器文件上传和下载

安装 Gin 框架：

```sh
go get github.com/gin-gonic/gin
```

完整代码：

```go
package main

import (
	"context"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func main() {
	// 创建一个上下文，用于超时和取消等操作的处理，这里直接使用默认的实现
	ctx := context.Background()
	// 创建 minio 客户端
	endpoint := "127.0.1:9000"
	id := "admin"
	secret := "adminadmin"
	SessionToken := ""
	bucketName := "test"
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(id, secret, SessionToken),
	})
	if err != nil {
		log.Fatalln(err)
	}
	// 创建 gin 路由
	router := gin.Default()
	// 文件上传
	router.POST("/upload", func(c *gin.Context) {
		// 读取文件
		file, _ := c.FormFile("file")
		reader, _ := file.Open()
		defer func() {
			// 关闭流
			_ = reader.Close()
		}()
		// 上传到 minio
		object, _ := minioClient.PutObject(ctx, bucketName, file.Filename, reader, file.Size, minio.PutObjectOptions{})
		// 返回上传文件的信息
		c.JSON(http.StatusOK, object)
	})
	// 文件下载
	router.GET("/file/:name", func(c *gin.Context) {
		name := c.Param("name")
		// 读取文件
		object, _ := minioClient.GetObject(ctx, bucketName, name, minio.GetObjectOptions{})
		defer func() {
			// 关闭流
			_ = object.Close()
		}()
		// 返回文件
		c.DataFromReader(http.StatusOK, -1, "application/stream", object, nil)
	})
	// 监听 8080
	_ = router.Run(":8080")
}
```

### 使用 Fiber 框架进行服务器文件上传和下载

安装 Fiber 框架：

```sh
go get github.com/gofiber/fiber/v2
```

完整代码：

```go
package main

import (
	"context"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/utils"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"log"
)

func main() {
	// 创建一个上下文，用于超时和取消等操作的处理，这里直接使用默认的实现
	ctx := context.Background()
	// 创建 minio 客户端
	endpoint := "127.0.1:9000"
	id := "admin"
	secret := "adminadmin"
	SessionToken := ""
	bucketName := "test"
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(id, secret, SessionToken),
	})
	if err != nil {
		log.Fatalln(err)
	}
	// 创建 fiber 路由
	app := fiber.New()
	// 文件上传
	app.Post("/upload", func(c *fiber.Ctx) error {
		// 读取文件
		file, err := c.FormFile("file")
		if err != nil {
			return err
		}
		reader, err := file.Open()
		if err != nil {
			return err
		}
		defer func() {
			// 关闭流
			_ = reader.Close()
		}()
		// 上传到 minio
		filename := utils.UUID()
		contentType := file.Header["Content-Type"][0]
		object, err := minioClient.PutObject(ctx, bucketName, filename, reader, file.Size, minio.PutObjectOptions{
			ContentType: contentType,
		})
		if err != nil {
			return err
		}
		// 返回上传文件的信息
		return c.JSON(object)
	})
	// 文件下载
	app.Get("/file/:name", func(c *fiber.Ctx) error {
		name := c.Params("name", "")
		// 读取文件
		object, err := minioClient.GetObject(ctx, bucketName, name, minio.GetObjectOptions{})
		if err != nil {
			return err
		}
		// 返回文件
		return c.SendStream(object)
	})
	// 监听 8080
	log.Fatal(app.Listen(":8080"))
}
```
