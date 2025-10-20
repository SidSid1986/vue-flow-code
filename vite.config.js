/*
 * @Author: Sid Li
 * @Date: 2025-08-08 10:28:51
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-20 09:30:08
 * @FilePath: \pic-demo-git\pic-demo\vite.config.js
 * @Description:
 */
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import viteImagemin from "vite-plugin-imagemin";
// import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import postCssPxToRem from "postcss-pxtorem";
import { resolve } from "path";
// 导入对应包
import ElementPlus from "unplugin-element-plus/vite";

// const prefix = import.meta.env.VITE_API_PREFIX;

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // console.log(env);
  // console.log(mode);
  return defineConfig({
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false, //
          javascriptEnabled: true, //
          additionalData: `@use "@/styles/element/index.scss" as *;`,
          // additionalData: `@use "@/styles/global.scss" as *; @use "@/styles/element/index.scss" as *;`,
        },
      },
      // loaderOptions: {
      //   sass: {
      //     // 自动导入定制化样式文件进行样式覆盖
      //     additionalData: `@use "@/styles/element/index.scss" as *;`,
      //   },
      // },
      postcss: {
        plugins: [
          postCssPxToRem({
            // 自适应，px>rem转换
            rootValue: 192, //pc端建议：192，移动端建议：75；设计稿宽度的1 / 10
            propList: ["*", "!border"], // 除 border 外所有px 转 rem // 需要转换的属性，这里选择全部都进行转换
            selectorBlackList: ["norem"], // 过滤掉norem-开头的class，不进行rem转换，这个内容可以不写
            unitPrecision: 5, // 转换后的精度，即小数点位数
            replace: true, // 是否直接更换属性值而不添加备份属性
            mediaQuery: true, // 是否在媒体查询中也转换px为rem
            minPixelValue: 0, // 设置要转换的最小像素值
          }),
        ],
      },
    },

    optimizeDeps: {
      include: [
        "element-plus",
        "@element-plus/icons-vue",
        "@element-plus/theme-chalk/src/index.css",
      ],
    },
    plugins: [
      vue(),
      viteImagemin({
        optipng: { optimizationLevel: 2 },
      }),
    ],

    base: "./", // 设置基础路径，用于生成静态资源的URL
    server: {
      host: "0.0.0.0",
      port: 9106,
      proxy: {
        "/api": {
          target: env.VITE_APP_API_HOST,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
        // "/get_fetch_image": {
        //   target: env.VITE_APP_API_HOST, // http://192.168.3.154:8000
        //   changeOrigin: true,
        //   rewrite: (path) => {
        //     // ✅ 如果后端接口就是 /get_fetch_image，那不需要 rewrite，或者写成：
        //     return "/get_fetch_image"; // 或者 return path; 根据实际情况
        //     // 如果你的真实图片 API 路径是比如 /api/camera/frame，请按需 rewrite
        //   },
        //   configure: (proxy, options) => {
        //     proxy.on("proxyRes", function (proxyRes, req, res) {
        //       // ✅ 关键：添加 CORS 头，让图片可被 canvas 使用
        //       proxyRes.headers["Access-Control-Allow-Origin"] = "*";
        //     });
        //   },
        // },
      },
    },

    build: {
      assetsInlineLimit: 4096,
      assetsDir: "assets",
      outDir: "dist",
    },
    assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
    configureWebpack: {
      devtool: process.env.NODE_ENV !== "production" ? "source-map" : "",
    },
  });
};
