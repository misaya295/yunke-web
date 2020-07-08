const baseUrl = process.env.VUE_APP_BASE_API

module.exports = {
  title: 'yunke-vue',
  // 获取令牌时，请求头信息(Basic Base64.encode(client_id:client_secret))
  authorizationValue: 'Basic eXVua2U6MTIzNDU2',
  // 社交登录后台地址
  socialLoginUrl: 'http://api.cloudx.cn:8301/auth/social/login',
  // 七牛云文件上传地址
  qiNiuUrl: baseUrl + 'oss/content',
  // 请替换为您的实际地址
  pages: {
    // Yunke-Admin 控制台地址
    springBootAdminUrl: 'http://localhost:8400/login',
    // kibana 控制台地址
    kibanaUrl: 'http://elk.yunke.cn',
    // nacos 控制台地址
    nacosUrl: 'http://nacos.yunke.cn/nacos',
    // skywalking地址
    skywalkingUrl: 'http://localhost:8080/',
    // 文档中心
    docUrl: 'http://localhost:8301/doc.html',
    // Granfana控制台
    grafanaUrl: 'http://localhost:8404/',
    // tx-manager控制台
    txUrl: 'http://localhost:8501/admin/index.html#/login'
  }
}
