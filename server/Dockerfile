FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Shanghai

WORKDIR /app

# 预编译的二进制文件（闭源）
COPY echov5 .
COPY config/ ./config/

# 内置主题和插件（首次启动时复制到共享卷）
COPY builtin/themes ./builtin/themes
COPY builtin/plugins ./builtin/plugins

# 启动脚本
COPY <<-ENTRYPOINT /entrypoint.sh
#!/bin/sh
if [ ! -d /shared/themes/default ]; then
  echo "[init] 初始化默认主题..."
  cp -r /app/builtin/themes/* /shared/themes/
fi
if [ ! -d /shared/plugins/sign ]; then
  echo "[init] 初始化默认插件..."
  cp -r /app/builtin/plugins/* /shared/plugins/
fi
exec ./echov5
ENTRYPOINT
RUN chmod +x /entrypoint.sh

EXPOSE 8080
CMD ["/entrypoint.sh"]
