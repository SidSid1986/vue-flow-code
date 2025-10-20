/*
 * @Author: Sid Li
 * @Date: 2025-08-08 10:28:51
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-09 14:17:26
 * @FilePath: \pic-demo-git\pic-demo\postcss.config.js
 * @Description: 
 */
module.exports = {
  plugins: {
    "postcss-pxtorem": {
      rootValue: 54, // 设计稿宽度的一半，比如设计稿是750px，则设置为37.5
      propList: ["*"], // 需要转换的属性，这里选择全部都进行转换
      selectorBlackList: [], // 过滤掉不需要转换的选择器
    },
  },
};
