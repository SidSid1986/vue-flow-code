/*
 * @Author: Sid Li
 * @Date: 2025-08-06 17:13:35
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-15 11:23:13
 * @FilePath: \pic-demo-git\pic-demo\src\main.js
 * @Description:
 */
import { createApp } from "vue";
import App from "./App.vue";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// import "@/styles/element/index.scss";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "@/styles/free-icons/iconfont.css";

import router from "@/router/index.js";

import store from "@/store";

// import useLocalStorageListener from "@/utils/localstorageListener";
// 引入rem适配
import "@/utils/rem.js";

// 引入flexible
import "amfe-flexible";

// useLocalStorageListener();

const app = createApp(App);
app.use(store);
app.use(ElementPlus);
app.use(router);

// app.directive("throttle", throttle);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
