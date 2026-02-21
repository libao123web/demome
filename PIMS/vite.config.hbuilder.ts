import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'fs'

// 构建后处理插件
function postBuildPlugin(): Plugin {
  return {
    name: 'post-build',
    closeBundle() {
      const destDir = resolve(__dirname, 'dist-hbuilder')
      
      // 复制 manifest.json
      const srcManifest = resolve(__dirname, 'hbuilder/manifest.json')
      const destManifest = resolve(destDir, 'manifest.json')
      if (existsSync(srcManifest)) {
        copyFileSync(srcManifest, destManifest)
        console.log('✓ manifest.json 已复制')
      }
      
      // 重命名 index.hbuilder.html 为 index.html
      const oldHtml = resolve(destDir, 'index.hbuilder.html')
      const newHtml = resolve(destDir, 'index.html')
      if (existsSync(oldHtml)) {
        if (existsSync(newHtml)) {
          unlinkSync(newHtml)
        }
        renameSync(oldHtml, newHtml)
        console.log('✓ index.html 已生成')
      }
      
      console.log('\n打包完成！请使用 HBuilderX 导入 dist-hbuilder 目录进行云打包')
    }
  }
}

// HBuilderX 5+ App 打包配置
export default defineConfig({
  base: './', // HBuilderX 需要相对路径
  plugins: [
    vue(),
    postBuildPlugin()
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
    outDir: 'dist-hbuilder',
    assetsDir: 'static',
    rollupOptions: {
      input: resolve(__dirname, 'index.hbuilder.html'),
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'static/css/[name]-[hash].[ext]'
          }
          return 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
