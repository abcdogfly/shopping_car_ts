// const path = require('path')

// function resolve(dir) {
//     return path.join(__dirname, './', dir)
// }
module.exports = {
    publicPath: "./",
    outputDir: 'dist',
    assetsDir: 'static',
    lintOnSave: false,
    productionSourceMap: false,
    // devServer: {
    //     port: 8080,
    //     open: true,
    //     proxy: {
    //         '/api':{
    //             target:'',
    //             changeOrigin:true,
    //             pathRewrite:{
    //                 '/api':''
    //             }
    //         },
    //         '/ms':{
    //             target: 'https://www.easy-mock.com/mock/592501a391470c0ac1fab128',
    //             changeOrigin: true
    //         }
    //     }
    // },
    
}