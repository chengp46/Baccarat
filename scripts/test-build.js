// scripts/test-build.js
const esbuild = require('esbuild');
const { build } = require('./build');

// 测试不同的构建配置
async function testBuilds() {
    console.log('🧪 开始测试构建...\n');

    // 测试1: 基础构建
    console.log('1. 测试基础构建...');
    await esbuild.build({
        entryPoints: ['src/index.js'],
        bundle: true,
        write: false, // 不写入磁盘
        minify: false,
        target: ['chrome58', 'edge16', 'firefox57', 'safari11', 'es2017']
    });
    console.log('✅ 基础构建测试通过\n');

    // 测试2: TypeScript 构建
    // console.log('2. 测试 TypeScript 构建...');
    // await esbuild.build({
    //     entryPoints: ['src/typescript-app.ts'],
    //     bundle: true,
    //     write: false,
    //     loader: { '.ts': 'ts' },
    // });
    // console.log('✅ TypeScript 构建测试通过\n');

    // 测试3: CSS 构建
    // console.log('3. 测试 CSS 构建...');
    // await esbuild.build({
    //     entryPoints: ['src/styles.css'],
    //     bundle: true,
    //     write: false,
    //     loader: { '.css': 'css' },
    // });
    // console.log('✅ CSS 构建测试通过\n');

    // 测试4: 完整项目构建
    console.log('4. 测试完整项目构建...');
    try {
        await build();
        console.log('✅ 完整项目构建测试通过\n');
    } catch (error) {
        console.error('❌ 完整项目构建失败:', error.message);
    }

    console.log('🎉 所有测试完成！');
}

testBuilds();