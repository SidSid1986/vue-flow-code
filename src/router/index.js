/*
 * @Author: Sid Li
 * @Date: 2025-08-06 17:13:35
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-27 14:02:47
 * @FilePath: \pic-demo-git\pic-demo\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";
import { encrypt, decrypt } from "@/utils/crypto";

// 路由配置
const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/home",
  },

  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home/home.vue"),
    meta: { requiresRole: 2 },
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound/notFound.vue"),
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫逻辑
// router.beforeEach((to, from, next) => {
//   const roleValue =
//     localStorage.getItem("roleValue") &&
//     decrypt(localStorage.getItem("roleValue"));

//   const firstLoadAccess = sessionStorage.getItem("firstLoadAccess") === "true";

//   if (to.path === "/load") {
//     // 如果访问 load 页面，设置首次访问标记
//     if (!firstLoadAccess) {
//       sessionStorage.setItem("firstLoadAccess", "true");
//     }
//     next();
//   } else if (to.path === "/register") {
//     // 检查首次进入 load 页面标记
//     if (firstLoadAccess) {
//       next();
//     } else {
//       next("/load");
//     }
//   } else if (to.matched.some((record) => record.meta.requiresRole)) {
//     // 判断角色权限
//     if (
//       (to.meta.requiresRole === 1 && roleValue === 1) ||
//       (to.meta.requiresRole === 2 && roleValue === 2)
//     ) {
//       next();
//     } else {
//       next("/register");
//     }
//   } else {
//     // 默认允许访问
//     next();
//   }
// });

export default router;
