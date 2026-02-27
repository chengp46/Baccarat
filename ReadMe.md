# 开发模式
npm run dev
# 或
node scripts/dev.js

# 生产构建
npm run build
# 或
node scripts/build.js

# 测试构建
npm run test:build

# 直接使用 ESBuild API
node -e "const esbuild = require('esbuild'); esbuild.build({...})"