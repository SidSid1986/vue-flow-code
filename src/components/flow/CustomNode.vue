<!--
 * @Author: Sid Li
 * @Date: 2025-10-18 08:37:27
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-10-20 14:42:10
 * @FilePath: \pic-demo-new\src\components\flow\CustomNode.vue
 * @Description: 
-->
<template>
  <div
    class="custom-node"
    :class="[`custom-node-${data.type}`, { selected: data.isSelected }]"
  >
    <!-- 显示节点标签 -->
    <span class="node-title">标题栏</span>
  </div>
</template>

<script setup>
import { Handle, Position } from "@vue-flow/core";
defineProps({
  data: { type: Object, required: true }, // 节点数据（包含 type 字段）
});

// 句柄样式（可根据节点类型差异化）
const handleTargetStyle = {
  background: "#ff4444",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  border: "1px solid #ffffff",
};

const handleSourceStyle = {
  background: "#00c853",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  border: "1px solid #ffffff",
};
</script>

<style scoped>
.custom-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 300px;
  height: 200px;
  border-radius: 8px;
  /* background-color: green; */
  /* background-color: #312E2C; */
  /* border: 1px solid #ddd; */
  color: #ffffff;
  box-sizing: border-box;
  padding: 0;

  pointer-events: auto !important;
}

.node-title {
  /* background-color: #535353; */
  display: inline-block;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  height: 30px;
  line-height: 30px;
  border-radius: 8px 8px 0 0;
  font-size: 20px;
  background: linear-gradient(to right, #4b728b, #273d4b, #3c515c, #2d2f2f);
  text-align: left;
  padding-left: 20px;
}

.custom-node-start {
  background-color: rgba(15, 17, 15, 0.5);
}

.custom-node-step {
  background-color: rgba(15, 17, 15, 0.5);
}

.custom-node-end {
  background-color: rgba(15, 17, 15, 0.5);
}

.node-label {
  /* pointer-events: none; */
  user-select: none;
  font-size: 14px;
  text-align: center;
  display: inline-block;
  width: 100%;
  background-color: red;
}

.handle-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* 选中状态下的节点样式 */
.custom-node.selected {
  /* border: 1px solid #ff4444 !important; */
  box-sizing: border-box;
  /* background-color: lightgreen !important;   */
  /* box-shadow: 0 0 8px rgba(255, 68, 68, 0.6); */
}
</style>
