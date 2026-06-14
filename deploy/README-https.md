# 配置 HTTPS 修复视频预览（WebCodecs）

## 为什么需要 HTTPS

视频预览（`AVCanvas`）和时间轴缩略图依赖浏览器的两项「安全上下文」(secure context) 能力：

- **WebCodecs API**（`VideoDecoder`）：解码视频帧
- **OPFS**（`navigator.storage.getDirectory`）：WebAV 解码时的临时存储

二者都只在 **HTTPS** 或 **localhost** 下可用。

当前通过 `http://85.137.247.69:10588` 这种「HTTP + 裸 IP」方式远程访问时，
`window.isSecureContext === false`，上述能力缺失，导致视频无法解码 ——
预览区一片黑、缩略图只显示占位图标，控制台常见报错：
`Cannot read properties of undefined (reading 'getDirectory')`。

在后端前面挂一层 HTTPS 反向代理即可彻底修复。前端的 API、Socket、OSS 文件 URL
全部基于「同源相对路径」推导，反代后会自动跟随 HTTPS，**无需改动任何前端代码**。

## 方式一：Docker Compose + Caddy

文件已准备好：`deploy/Caddyfile`、`deploy/docker-compose.yml`。

```bash
cd Toonflow-app
docker compose -f deploy/docker-compose.yml up -d --build
```

然后访问：**https://85.137.247.69**

- 自签证书会有一次性「您的连接不是私密连接」警告，点「高级 → 继续前往」即可。
- 关键点：自签证书下 `window.isSecureContext` 仍为 `true`，WebCodecs 可正常工作。

### 有域名的情况（无证书警告，最佳）

把 `deploy/Caddyfile` 里的：

```
https://85.137.247.69 {
	tls internal
	...
}
```

改成（替换域名、删除 `tls internal`）：

```
https://your-domain.com {
	reverse_proxy app:10588
	request_body {
		max_size 100MB
	}
}
```

Caddy 会自动向 Let's Encrypt 申请受信任证书（需域名解析到本机、放通 80/443）。

## 方式二：裸机直跑 + 单独的 Caddy（当前部署，推荐）

当前服务器不是 Docker，而是直接 `npx tsx src/app.ts` 跑后端（监听 10588 纯 HTTP）。
此时只需在它前面单独跑一个 Caddy 进程做 HTTPS 终止，反代到本机 10588。

> 注意：直接用 `https://85.137.247.69` 访问当前的裸进程会报 `ERR_SSL_PROTOCOL_ERROR`，
> 因为后端只会说纯 HTTP、没有任何东西处理 TLS。必须按本节加一层 Caddy 才有 HTTPS。

配置文件已准备好：`deploy/Caddyfile.baremetal`（上游是 `localhost:10588`）。

```bash
# 1. 安装 Caddy（Debian/Ubuntu）
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 2. 启动 Caddy（后台常驻）
caddy start --config /root/Toonflow-new/deploy/Caddyfile.baremetal

# 调试时可前台运行查看日志：
# caddy run --config /root/Toonflow-new/deploy/Caddyfile.baremetal
```

放通安全组/防火墙 443 端口后，访问 **https://85.137.247.69**，自签证书点「继续前往」即可。

### 让 Caddy 开机自启（systemd）

```ini
# /etc/systemd/system/toonflow-caddy.service
[Unit]
Description=Caddy HTTPS proxy for Toonflow
After=network.target

[Service]
ExecStart=/usr/bin/caddy run --config /root/Toonflow-new/deploy/Caddyfile.baremetal
ExecReload=/usr/bin/caddy reload --config /root/Toonflow-new/deploy/Caddyfile.baremetal
Restart=on-failure
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now toonflow-caddy
```

## 方式三：已有 Nginx，手动配 TLS

若服务器已用 Nginx，可用自签证书生成后反代：

```bash
# 1. 生成自签证书（给 IP 签 SAN，有效期 825 天）
openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
  -keyout /etc/nginx/certs/toonflow.key \
  -out /etc/nginx/certs/toonflow.crt \
  -subj "/CN=85.137.247.69" \
  -addext "subjectAltName=IP:85.137.247.69"
```

Nginx server 块：

```nginx
server {
    listen 443 ssl;
    server_name 85.137.247.69;

    ssl_certificate     /etc/nginx/certs/toonflow.crt;
    ssl_certificate_key /etc/nginx/certs/toonflow.key;

    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:10588;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Socket.IO / WebSocket 升级
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 视频/大文件代理：关闭缓冲，支持 Range 断点
        proxy_buffering off;
    }
}
```

```bash
nginx -t && nginx -s reload
```

访问 **https://85.137.247.69**（自签同样有一次性警告，继续即可）。

## 验证

访问 HTTPS 地址后，打开 DevTools Console：

```js
console.log(window.isSecureContext, typeof VideoDecoder)
// 期望：true "function"
```

回到剪辑台，视频预览应能正常显示画面、时间轴缩略图也会渲染出真实帧。

## 备注

- 后端 `app.ts` 监听的是 HTTP（10588），TLS 终止在反代层，这是标准做法，后端无需改动。
- 防火墙/安全组需放通 443（和用于证书申请/跳转的 80）。
- 自签证书仅消除「功能受限」（WebCodecs 不可用），但浏览器仍会标记证书不受信任；
  要去掉警告必须使用域名 + 受信任 CA（方式一的域名分支）。
