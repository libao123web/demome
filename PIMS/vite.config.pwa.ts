import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// PWA版配置 - 支持离线使用和安装
export default defineConfig({
  base: '/', // PWA需要从根路径访问
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'PIMS - 人员信息管理系统',
        short_name: 'PIMS',
        description: '人员信息管理系统 - 支持离线使用',
        theme_color: '#1890ff',
        background_color: '#f0f2f5',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // 缓存所有静态资源
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2,ttf,eot}'],
        // 运行时缓存策略
        runtimeCaching: [
          {
            // 缓存字体文件
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 缓存图片
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          }
        ],
        // 最大缓存大小
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },
      devOptions: {
        enabled: true, // 开发环境启用PWA
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1890ff'
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist-pwa',
    assetsDir: 'assets',
    sourcemap: false,
    // PWA版本可以使用代码分割优化加载
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'antd-vendor': ['ant-design-vue', '@ant-design/icons-vue'],
          'utils-vendor': ['axios', 'dayjs', 'mockjs', 'xlsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
