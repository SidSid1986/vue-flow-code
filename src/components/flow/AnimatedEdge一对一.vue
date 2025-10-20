<!-- AnimatedEdge.vue -->
<template>
  <BaseEdge
    :id="id"
    ref="edgeRef"
    :path="path[0]"
    :style="{
      stroke: isSelected ? '#ff0000' : '#6b7280',
      strokeWidth: 2,
    }"
  />

  <EdgeLabelRenderer>
    <div
      ref="labelRef"
      :style="{
        visibility: isAnimating ? 'visible' : 'hidden',
        position: 'absolute',
        zIndex: 1,
        offsetPath: `path('${path[0]}')`,
        offsetRotate: '0deg',
        offsetAnchor: 'center',
      }"
    >
      <span>📦</span>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@vue-flow/core";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    default: "right",
  },
  targetPosition: {
    type: String,
    default: "left",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const labelRef = ref();
const edgeRef = ref();
const isAnimating = ref(false);
let animation = null;

const path = computed(() => getSmoothStepPath(props));

const isSelected = computed(() => props.data.isSelected || false);

// 开始动画
function startAnimation() {
  if (isAnimating.value) return;

  const pathEl = edgeRef.value?.pathEl;
  const labelEl = labelRef.value;

  if (!pathEl || !labelEl) return;

  const totalLength = pathEl.getTotalLength();
  isAnimating.value = true;

  // 定义动画关键帧
  const keyframes = [{ offsetDistance: "0%" }, { offsetDistance: "100%" }];

  // 根据路径长度计算动画持续时间
  const duration = Math.min(Math.max(totalLength * 5, 1000), 3000);

  // 创建动画
  const anim = labelEl.animate(keyframes, {
    duration,
    easing: "ease-in-out",
    iterations: 1,
  });

  // 动画结束处理
  anim.onfinish = () => {
    isAnimating.value = false;
  };

  animation = anim;
}

// 监听是否需要开始动画
watch(
  () => props.data.startAnimation,
  (start) => {
    if (start) {
      startAnimation();
      // 重置触发状态
      if (props.data.onAnimationStart) {
        props.data.onAnimationStart(false);
      }
    }
  }
);
</script>
