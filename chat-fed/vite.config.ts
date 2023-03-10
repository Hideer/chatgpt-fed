import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '127.0.0.1',
    port: 8080,
    proxy: {
      "/apis": {
        target: "http://39.98.113.111",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apis/, ""),
      },
    },
  },
  base:'./',
  resolve: {
    alias: {
      '@':path.resolve(__dirname, "src"),
      'components':path.resolve(__dirname, "src/components")
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "${path.resolve(__dirname, 'src/global.less')}";`
      }
    },
    postcss: {
      plugins: [
        require("autoprefixer"),
        // require("postcss-px-to-viewport")({
        //   viewportWidth: 750,  //视窗的宽度，对应的是我们设计稿的宽度，一般是750
        //   viewportHeight: 1334, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
        //   unitPrecision: 3,       // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
        //   viewportUnit: 'vw',     // 指定需要转换成的视窗单位，建议使用vw
        //   selectorBlackList: ['.ignore', '.hairlines'],  // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
        //   minPixelValue: 1,       // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
        //   mediaQuery: false       // 允许在媒体查询中转换`px`
        // })
      ]
    }
  }
})