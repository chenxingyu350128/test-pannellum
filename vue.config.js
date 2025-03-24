module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    // 配置url-loader处理图片资源
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000, // 小于10kb的图片会被转为base64
        name: 'img/[name].[hash:7].[ext]',
        esModule: false // 避免[object Module]问题
      })
  }
}