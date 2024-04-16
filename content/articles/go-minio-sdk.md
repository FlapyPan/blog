---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-09-05T00:00:00.000Z
update: 2023-11-21T07:04:59.500Z
---

Minio 官方提供了 Go 的 SDK，可以使用下列指令安装：

```sh
go get github.com/minio/minio-go/v7
```

并且提供了对应的文档：<https://min.io/docs/minio/linux/developers/go/API.html>

## Go SDK 基本使用

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

## 使用 Gin 框架进行服务器文件上传和下载

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

## 使用 Fiber 框架进行服务器文件上传和下载

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
