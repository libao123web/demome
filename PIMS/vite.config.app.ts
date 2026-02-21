import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Capacitor APP 打包配置
export default defineConfig({
  base: './', // Capacitor 需要相对路径
  plugins: [vue()],
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
  build: {
    outDir: 'dist-app',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined, // 不分割代码块，减少文件数量
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
