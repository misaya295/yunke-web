FROM nginx:1.14.2
MAINTAINER Yunke Yunke@foxmail.com

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/ /etc/nginx/html
