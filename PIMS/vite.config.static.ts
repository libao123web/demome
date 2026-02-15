import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 自定义插件：移除 type="module"，并将脚本移到 body 末尾
function removeModulePlugin(): Plugin {
  return {
    name: 'remove-module-type',
    enforce: 'post',
    transformIndexHtml(html) {
      // 移除 type="module" 和 crossorigin 属性
      let result = html
        .replace(/<script type="module" crossorigin/g, '<script defer')
        .replace(/<script type="module"/g, '<script defer')
        .replace(/crossorigin /g, '')
        // 移除 manifest.json 引用，避免 file:// 协议下的 CORS 错误
        .replace(/<link rel="manifest"[^>]*>\n?\s*/g, '')
      return result
    }
  }
}

// 静态页面版配置 - 可直接打开HTML运行
export default defineConfig({
  base: './', // 使用相对路径，支持直接打开HTML文件
  plugins: [
    vue(),
    removeModulePlugin()
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
  build: {
    outDir: 'dist-static',
    assetsDir: 'assets',
    sourcemap: false,
    // 关键：使用传统脚本格式，支持 file:// 协议直接打开
    target: 'es2015',
    modulePreload: false,
    // CSS 不内联到 JS 中
    cssCodeSplit: false,
    // 禁用代码分割，将所有资源打包到一起
    rollupOptions: {
      output: {
        // 使用 IIFE 格式，不使用 ES Module
        format: 'iife',
        // 禁用代码分割，所有代码打包成单个文件
        manualChunks: undefined,
        inlineDynamicImports: true,
        // 使用固定的文件名
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // CSS 文件统一命名
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/main.css'
          }
          // 其他资源保持原名
          return 'assets/[name].[ext]'
        }
      }
    },
    // 内联小于4kb的资源为base64
    assetsInlineLimit: 4096,
    // 提高chunk大小警告阈值
    chunkSizeWarningLimit: 5000,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  }
})
