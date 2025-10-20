<template>
  <div class="container" ref="containerRef">
    <!-- 左侧面板：包含 Flow 组件 -->
    <div class="left-panel" :style="{ width: leftWidth + 'vw' }">
      <Flow @changeTime="changeTime" :panelWidth="leftWidth" />
    </div>

    <!-- 拖拽分割线 -->
    <div class="divider" @mousedown="startDrag"></div>

    <!-- 右侧面板：包含 ImgShow 组件 -->
    <div class="right-panel" :style="{ width: rightWidth + 'vw' }">
      <ImgShow
        :processTimeProp="processTimeProp"
        :rightWidthProp="rightWidth"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Flow from "@/components/flow/Flow.vue"; // 请根据你的实际路径调整
import ImgShow from "@/components/img/ImgShow.vue"; // 请根据你的实际路径调整

// 用于接收来自 Flow 组件的时间数据
const processTimeProp = ref(null);

// 容器引用（虽然在这个方案中没直接用到，但保留以备扩展）
const containerRef = ref(null);

// 左右面板宽度，单位是 vw
const leftWidth = ref(49.9);
const rightWidth = ref(49.9);

// 拖拽状态
const isDragging = ref(false);

// 拖拽起始信息
const startX = ref(0);
const startLeftWidth = ref(49.9);

// 当右侧宽度发生变化时触发
const changeTime = (time) => {
  console.log("time:", time);
  processTimeProp.value = time;
};

// 定义：右侧最小宽度为 30vw（你可以按需调整这个值，比如 25、35 等）
const MIN_RIGHT_WIDTH_VW = 28;

// 开始拖拽
const startDrag = (e) => {
  console.log("开始拖拽");
  isDragging.value = true;
  startX.value = e.clientX;
  startLeftWidth.value = leftWidth.value;

  // 添加全局鼠标事件监听
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);

  // 阻止默认的拖拽行为与文本选择
  e.preventDefault();
};

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return;

  console.log("拖拽中...", e.clientX);

  if (containerRef.value) {
    console.log("拖拽计算");
    const container = containerRef.value;
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;

    // 计算新的左侧宽度（基于当前鼠标位置）
    let newLeftWidth = (mouseX / containerWidth) * 100;
    newLeftWidth = Math.max(10, Math.min(89.5, newLeftWidth)); // 限制一下，避免极端情况

    // 计算新的右侧宽度
    const newRightWidth = 100 - newLeftWidth - 0.2; // 减去分割线 1vw

    // ===== 重点：限制右侧最小宽度为 30vw =====
    if (newRightWidth < MIN_RIGHT_WIDTH_VW) {
      console.log(
        `右侧宽度 ${newRightWidth.toFixed(
          1
        )}vw 小于最小限制 ${MIN_RIGHT_WIDTH_VW}vw，阻止继续缩小`
      );

      // 计算：允许的最小右侧宽度对应的左侧宽度
      const allowedLeftWidth = 100 - MIN_RIGHT_WIDTH_VW - 0.2;

      // 限制左侧，从而保证右侧 >= 30vw
      newLeftWidth = Math.min(newLeftWidth, allowedLeftWidth);

      // 重新计算右侧宽度
      const finalNewRightWidth = 100 - newLeftWidth - 0.2;
      console.log(`已限制：当前右侧宽度为 ${finalNewRightWidth.toFixed(1)}vw`);

      // 更新宽度
      leftWidth.value = newLeftWidth;
      rightWidth.value = finalNewRightWidth;

      // 不调用 stopDrag()，不中断拖拽，继续可以拖拽变大
      return;
    }
    // ===== 结束限制 =====

    // 如果右侧宽度合法，正常更新
    leftWidth.value = newLeftWidth;
    rightWidth.value = newRightWidth;
  } else {
    console.log("222222");
    // 备选方案：基于窗口宽度（如果不想依赖 containerRef，用上面的方案）
    const deltaX = e.clientX - startX.value;
    let newLeftWidth =
      startLeftWidth.value + (deltaX / window.innerWidth) * 100;
    newLeftWidth = Math.max(10, Math.min(89.5, newLeftWidth));

    const newRightWidth = 100 - newLeftWidth - 0.2;

    if (newRightWidth < MIN_RIGHT_WIDTH_VW) {
      const allowedLeftWidth = 100 - MIN_RIGHT_WIDTH_VW - 0.2;
      newLeftWidth = Math.min(newLeftWidth, allowedLeftWidth);
      const finalNewRightWidth = 100 - newLeftWidth - 0.2;

      leftWidth.value = newLeftWidth;
      rightWidth.value = finalNewRightWidth;
      return;
    }

    leftWidth.value = newLeftWidth;
    rightWidth.value = newRightWidth;
  }
};

// 停止拖拽
const stopDrag = () => {
  console.log("停止拖拽");
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

// 鼠标离开窗口时停止拖拽
const handleMouseLeave = () => {
  if (isDragging.value) {
    stopDrag();
  }
};

// 生命周期：添加/移除事件监听
onMounted(() => {
  document.addEventListener("mouseleave", handleMouseLeave);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("mouseleave", handleMouseLeave);
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  justify-content: space-between;
}

.left-panel,
.right-panel {
  height: 100%;
  /* overflow: auto; */
}

.divider {
  width: 0.2vw;
  background-color: #ffffff;
  cursor: col-resize;
  position: relative;
  flex-shrink: 0;
  min-height: 100%;
  z-index: 10;
}

.divider:hover {
  background-color: pink;
}

.divider::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 40%,
    #999 40%,
    #999 60%,
    transparent 60%,
    transparent 100%
  ); */
  opacity: 0.3;
}

.divider:hover::before {
  opacity: 0.6;
}

/* 禁用文本选择和元素拖拽 */
.container {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.container * {
  box-sizing: border-box;
  /* -webkit-user-drag: none; */
  /* -khtml-user-drag: none; */
  /* -moz-user-drag: none; */
  /* -o-user-drag: none; */
  /* user-drag: none; */
}

.divider {
  pointer-events: auto;
  touch-action: none;
}
</style>
