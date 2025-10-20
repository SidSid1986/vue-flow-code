<!--
 * @Author: Sid Li
 * @Date: 2025-10-11 13:46:05
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-10-17 14:46:13
 * @FilePath: \pic-demo\src\components\flow\Flow.vue
 * @Description: 
-->
<template>
  <div class="rete-container">
    <div class="controls">
      <button class="render-btn" @click="render">节点渲染</button>
      <button class="remove-btn" @click="remove">画布重置</button>
    </div>
    <div class="canvas-wrapper">
      <div class="rete" ref="rete"></div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { createEditor } from "@/rete/editor";
const rete = ref(null);
let cleanup = null;

const myLogFunc = (text) => {
  // console.log("从Log节点输出:", text);
};
const render = async () => {
  cleanup = await createEditor(rete.value, myLogFunc);
};

const remove = () => {
  console.log(cleanup);
  if (!cleanup) {
    alert("렌더링을 먼저 해주세요");
    return;
  }
  cleanup();
  cleanup = null;
};

onMounted(async () => {
  render();
});
</script>

<style scoped lang="scss">
.rete-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  justify-content: flex-start;
}
/* 버튼 영역 */
.controls {
  display: flex;
  justify-content: flex-start; /* 왼쪽 정렬 */
  align-items: center;
  gap: 15px; /* 버튼 사이 간격 */
  padding: 10px 20px;
  background-color: #ffffff;
  border-bottom: 2px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 약간 그림자 */
}

/* 캔버스 영역 */
.canvas-wrapper {
  width: 100%;
  height: 100%;
  border: 2px solid blue;
  background-color: #f9f9f9;
}

.rete {
  display: flex;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  border: 2px solid red;
}
</style>
