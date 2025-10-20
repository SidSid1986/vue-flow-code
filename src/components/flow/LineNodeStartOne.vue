<template>
  <div
    class="custom-node"
    :class="[`custom-node-${data.type}`, { selected: data.isSelected }]"
  >
    <!-- 显示节点标签 -->

    <div class="node-label">
      <span>{{ data.label }}</span>
      <el-icon class="play-icon" @click="playCode"><VideoPlay /></el-icon>
    </div>

    <!-- 句柄容器 - 必须要有这个容器 -->
    <div class="handle-container">
      <!-- 动态渲染句柄 -->
      <template v-if="data.type === 'start-line'">
        <!-- 开始节点：只有底部句柄（作为source，连接下方节点） -->
        <Handle
          type="source"
          :position="Position.Right"
          :isConnectable="true"
          :style="handleSourceStyle"
        />
      </template>

      <template v-else-if="data.type === 'end-line'">
        <!-- 结束节点：只有顶部句柄（作为target，连接上方节点） -->
        <Handle
          type="target"
          :position="Position.Left"
          :isConnectable="true"
          :style="handleTargetStyle"
        />
      </template>

      <template v-else>
        <!-- 步骤节点：上面句柄作为target，连接上一个节点的source；下面句柄作为source，连接下一个节点的target -->
        <Handle
          type="target"
          :position="Position.Left"
          :isConnectable="true"
          :style="handleTargetStyle"
        />
        <Handle
          type="source"
          :position="Position.Right"
          :isConnectable="true"
          :style="handleSourceStyle"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { Handle, Position } from "@vue-flow/core";
defineProps({
  data: { type: Object, required: true }, // 节点数据（包含 type 字段）
});

const playCode = () => {
  console.log("播放代码");
};

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

<style scoped lang="scss">
.custom-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 40px;
  border-radius: 8px;
  background-color: green;
  /* border: 1px solid #ddd; */
  color: #ffffff;
  box-sizing: border-box;
  padding: 0;
}

.node-title {
  background-color: yellow;
  display: inline-block;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  border-radius: 8px 8px 0 0;
}

.custom-node-start {
  background-color: #ffc0cb;
}

.custom-node-end {
  background-color: #ffc0cb;
}

.node-label {
  /* pointer-events: none; */
  user-select: none;
  font-size: 18px;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  /* background-color: red; */
  z-index: 1000;
  font-weight: normal;
  span {
    height: 40px;
    line-height: 40px;
    // border: 1px solid red;
  }
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
