// scripts/build.js
const esbuild = require('esbuild');
const { readdirSync, existsSync, mkdirSync } = require('fs');
const { join, basename } = require('path');

// 确保目录存在
function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function build() {
  console.time('🏗️ 构建时间');
  try {
    // 清理 dist 目录
    const distDir = join(__dirname, '../dist');
    ensureDir(distDir);

    const assetsDir = join(__dirname, '../dist/assets');
    ensureDir(assetsDir);

    // 复制 public 目录
    const publicDir = join(__dirname, '../assets');
    if (existsSync(publicDir)) {
      require('fs-extra').copySync(publicDir, assetsDir);
      console.log('📁 复制 public 目录');
    }

    // 构建配置
    const buildOptions = {
      entryPoints: [join(__dirname, '../src/index.js')],
      bundle: true,
      outdir: distDir,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      target: ['chrome58', 'firefox57', 'safari11', 'edge16', 'es2017'],
      platform: 'browser',
      format: 'esm',
      splitting: true,
      chunkNames: 'chunks/[name]-[hash]',
      assetNames: 'assets/[name]-[hash]',
      treeShaking: true,
      metafile: true,
      define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'production'}"`,
        'process.env.API_URL': `"${process.env.API_URL || 'https://api.example.com'}"`,
      },
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.css': 'css',
        '.json': 'json',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
        '.svg': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
      },
      plugins: [
        // 自定义插件示例
        {
          name: 'on-end-plugin',
          setup(build) {
            build.onEnd(result => {
              if (result.errors.length > 0) {
                console.error('❌ 构建错误:', result.errors);
              } else {
                console.log(`✅ 构建成功！生成 ${result.outputFiles?.length || 0} 个文件`);

                // 生成构建报告
                if (result.metafile) {
                  const metaPath = join(distDir, 'meta.json');
                  require('fs').writeFileSync(
                    metaPath,
                    JSON.stringify(result.metafile, null, 2)
                  );
                  console.log(`📊 构建报告: ${metaPath}`);
                }
              }
            });
          },
        }
      ],
    };
    // 执行构建
    const result = await esbuild.build(buildOptions);
    const fs = require('fs');
    // 分析构建结果
    analyzeBuild(result);

    const htmlMinifier = require('html-minifier-terser');
    // 2. 读取并压缩 HTML
    let html = fs.readFileSync('./index.html', 'utf8');
    // 替换资源路径（如果需要）
    html = html
      .replace('src/index.js', './index.js');

    // 3. 压缩 HTML
    const minifiedHtml = await htmlMinifier.minify(html, {
      collapseWhitespace: true,           // 折叠空白字符
      removeComments: true,               // 删除注释
      removeRedundantAttributes: true,    // 删除冗余属性
      removeScriptTypeAttributes: true,   // 删除 script 的 type="text/javascript"
      removeStyleLinkTypeAttributes: true, // 删除 style/link 的 type 属性
      useShortDoctype: true,              // 使用简短的 doctype
      minifyCSS: true,                    // 压缩内联 CSS
      minifyJS: true,                     // 压缩内联 JS
      minifyURLs: true,                   // 压缩 URL
      removeAttributeQuotes: true,        // 删除属性引号（如果可以）
      removeOptionalTags: true,           // 删除可选标签
      sortClassName: true,                // 对 class 名排序
      sortAttributes: true,               // 对属性排序
    });

    // 4. 写入压缩后的 HTML
    fs.writeFileSync('dist/index.html', minifiedHtml);
    console.log('✅ HTML 压缩完成！');
    console.timeEnd('🏗️ 构建时间');

  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 分析构建结果
function analyzeBuild(result) {
  if (result.metafile) {
    const outputs = result.metafile.outputs;
    let totalSize = 0;

    Object.keys(outputs).forEach(file => {
      const size = outputs[file].bytes;
      totalSize += size;
      console.log(`  ${basename(file)}: ${formatSize(size)}`);
    });

    console.log(`📦 总大小: ${formatSize(totalSize)}`);
    console.log(`📁 文件数量: ${Object.keys(outputs).length}`);
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// 执行构建
if (require.main === module) {
  build();
}

module.exports = { build };