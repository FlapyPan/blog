---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-07-28T00:00:00.000Z
update: 2023-07-28T00:00:00.000Z
---

# Dockerfile 示例

## Spring Boot 应用

```Dockerfile
LABEL maintainer="Demo Docker Image <FlapyPan@gmail.com>"

# 构建用镜像
FROM maven:3.8.6-eclipse-temurin-17-alpine AS build

# 指定构建过程中的工作目录
WORKDIR /build

# 将src目录下所有文件，拷贝到工作目录中src目录下
COPY src /build/src

# 拷贝配置文件
COPY pom.xml /build

# 执行代码编译命令
RUN mvn mvn -f /build/pom.xml clean package -Dmaven.test.skip=true

# 运行时镜像
FROM eclipse-temurin:17-jre AS RUN

# 指定运行时的工作目录
WORKDIR /app
# 设置数据卷
VOLUME /app/data

# 将构建产物jar包拷贝到运行时目录中
COPY --from=build /build/target/*.jar ./springboot.jar

# 暴露端口
EXPOSE 8080

# 执行启动命令
CMD ["java","-Xms512M", "-Xmx512M", "-jar", "/app/springboot.jar"]
```
