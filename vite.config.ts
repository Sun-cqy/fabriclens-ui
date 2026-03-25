import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    // 开发服务器配置
    server: {
      port: 3000, // 开发服务器端口
      open: true, // 自动打开浏览器
      proxy: {
        // API代理配置
        '/api': {
          target: 'http://localhost:8080', // 修改后端API地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/search': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/images': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/auth': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/user': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/favorites': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/image': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/user-center': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    // 构建优化
    build: {
      target: 'es2015', // 兼容性目标
      minify: 'terser', // 使用terser进行压缩
      terserOptions: {
        compress: {
          drop_console: isProd, // 生产环境去除console
          drop_debugger: isProd // 生产环境去除debugger
        }
      },
      // 拆分chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'ant-design': ['ant-design-vue'],
            'fabric': ['fabric']
          }
        }
      },
      // 启用CSS代码分割
      cssCodeSplit: true,
      // 产物将部署在非根目录时需调整
      base: isProd ? '/fabric-lens/' : '/',
      // 启用sourcemap方便调试
      sourcemap: !isProd
    },
    // CSS配置
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true, // 支持ant-design-vue的定制主题
          modifyVars: {
            // 定制ant-design-vue主题
            'primary-color': '#1890ff', // 主题色
            'link-color': '#1890ff', // 链接色
            'border-radius-base': '4px' // 组件/浮层圆角
          }
        }
      }
    }
  }
})
