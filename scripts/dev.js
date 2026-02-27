// scripts/dev.js
const esbuild = require('esbuild');
const { spawn } = require('child_process');
const path = require('path');

async function startDevServer() {
  console.log('🚀 启动开发服务器...');
  
  // 创建构建上下文
  const ctx = await esbuild.context({
    entryPoints: [path.join(__dirname, '../src/index.js')],
    bundle: true,
    outdir: path.join(__dirname, '../dist'),
    sourcemap: true,
    target: ['es2020'],
    platform: 'browser',
    format: 'esm',
    splitting: true,
    define: {
      'process.env.NODE_ENV': '"development"',
    },
    loader: {
      '.js': 'jsx',
      '.css': 'css',
      '.png': 'file',
    },
    plugins: [
      // 开发服务器插件
      {
        name: 'dev-server',
        setup(build) {
          build.onEnd(result => {
            if (result.errors.length === 0) {
              console.log('✅ 重新构建完成');
            }
          });
        },
      },
    ],
  });
  
  // 监听文件变化
  await ctx.watch();
  console.log('👀 开始监听文件变化...');
  
  // 启动开发服务器
  const { host, port } = await ctx.serve({
    servedir: path.join(__dirname, '../dist'),
    port: 6000,
    host: 'localhost',
    fallback: path.join(__dirname, '../dist/index.html'),
    onRequest: ({ method, path, status, timeInMS }) => {
      const statusColor = status >= 400 ? '\x1b[31m' : '\x1b[32m';
      console.log(`${method} ${path} ${statusColor}${status}\x1b[0m ${timeInMS}ms`);
    },
  });
  
  console.log(`🌐 开发服务器: http://localhost:${port}`);
  console.log(`📁 服务目录: ${path.join(__dirname, '../dist')}`);
  
  // 自动打开浏览器
  const url = `http://127.0.0.1:${port}`;
  const openCommand = process.platform === 'win32' ? 'start' : 'open';
  spawn(openCommand, [url], { stdio: 'ignore' });
  
  // 优雅关闭
  const shutdown = async () => {
    console.log('\n🛑 关闭开发服务器...');
    await ctx.dispose();
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);  // Ctrl+C
  process.on('SIGTERM', shutdown); // kill 命令
  
  // 保持进程运行
  process.stdin.resume();
}

// 错误处理
startDevServer().catch(error => {
  console.error('❌ 启动失败:', error);
  process.exit(1);
});