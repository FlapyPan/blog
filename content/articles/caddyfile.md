---
layout: page
cover: /social-card-preview.webp
author:
  name: FlapyPan
  avatarUrl: https://avatars.githubusercontent.com/u/67328567
  link: https://flapypan.top
date: 2023-08-03T00:00:00.000Z
update: 2023-08-03T00:00:00.000Z
---

# Caddy 常用配置文件

[官方文档](https://caddyserver.com/docs/)

[HSTS 参考](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Strict-Transport-Security) 

```caddyfile
{
        # 关闭管理面板
        admin off
}

# 通用配置块
(COMMON_CONFIG) {
        # 压缩支持 (br 需要额外插件)
        encode zstd br gzip
        # HSTS 推荐的时间是 2 年
        header Strict-Transport-Security "max-age=63072000; includeSubDomains"
        # 去除 Server 响应头
        header -Server
        # 禁止部分爬虫的ua
        @norobots {
                header_regexp User-Agent "^(|360Spider|JikeSpider|Spider|spider|bot|Bot|2345Explorer|curl|wget|webZIP|qihoobot|Baiduspider|Googlebot(-Mobile|-Image)?|Mediapartners-Google|Adsbot-Google|Feedfetcher-Google|Yahoo! Slurp( China)?|YoudaoBot|Sosospider|Sogou( spider| web spider)|MSNBot|ia_archiver|Tomato Bot|NSPlayer|bingbot)?$"
        }
        redir @norobots http://localhost/ permanent
}

# 站点配置

flapypan.top {
        # 重定向到www
        redir https://www.flapypan.top{uri}
        import COMMON_CONFIG
}

blog.flapypan.top {
        # 重定向到www
        redir https://www.flapypan.top{uri}
        import COMMON_CONFIG
}

www.flapypan.top {
        root * /home/flapypan/blog/dist
        route {
                # handle_path 去除前缀，handle 保留
                handle_path /api/* {
                        # 反向代理
                        reverse_proxy localhost:8080
                }
                # 单页面应用
                try_files {path}.html {path} /
                file_server
        }
        import COMMON_CONFIG
}
```
