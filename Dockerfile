######## 编译构建过程
# 带有编译/构建环境的docker image
FROM docker.dm-ai.cn/public/node:12-alpine3.12

# 设置当前工作目录
WORKDIR /opt/

# 将本地文件复制到docker image中
COPY . .

# 执行编译/构建命令
RUN yarn install --registry='http://nexus.dm-ai.cn/repository/npm/'
RUN npm run build


FROM docker.dm-ai.cn/devops/base-image-compile-run-frontend:0.02
ENV TZ=Asia/Shanghai
COPY --from=0 /opt/dist /usr/share/nginx/html
COPY --from=0 /opt/nginx.conf /etc/nginx/conf.d/default.conf

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log
EXPOSE 80
CMD nginx -g "daemon off;"

