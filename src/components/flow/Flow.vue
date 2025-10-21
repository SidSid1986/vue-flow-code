<template>
  <div class="flow-container" @click="handleGlobalClick">
    <!-- 节点库 -->
    <div class="flow-menu">
      <button @click="exportFlowJSON" class="export-btn">📥导出流程</button>
      <button class="delete-btn" @click="clearSelectedNode">🗑️ 清空节点</button>
      <button class="delete-btn" @click="deleteSelectedEdge">
        🗑️ 删除连线
      </button>
      <button class="delete-btn" @click="deleteSelectedNode">
        🗑️ 删除节点
      </button>
      <!-- <button @click="startFlowAnimation" style="margin-top: 12px">
        开始流程动画
      </button> -->
      <!-- <div>节点库</div> -->
      <div class="node-templates-container">
        <div class="node-templates-border">
          <el-menu
            default-active=""
            mode="vertical"
            class="node-menu"
            @select="handleMenuSelect"
          >
            <!-- 遍历每一个分组 -->
            <el-sub-menu
              v-for="(group, groupIdx) in nodeTemplates"
              :key="groupIdx"
              :index="`group-${groupIdx}`"
            >
              <!-- 一级菜单标题：显示分组名，比如「测试集合1」 -->
              <template #title>
                <span>{{ group.groupName }}</span>
              </template>

              <!-- 遍历该分组下的所有节点 -->
              <el-menu-item
                v-for="(node, nodeIdx) in group.nodes"
                :key="nodeIdx"
                :index="`node-${groupIdx}-${nodeIdx}`"
                :class="
                  node.data.parentNode == null
                    ? 'menu-item-wrapper'
                    : 'menu-item-wrapper-none'
                "
              >
                <!-- ：使用插槽 #default 自定义内容，放入一个可拖拽的 div -->
                <template #default>
                  <div
                    draggable="true"
                    @dragstart="
                      (e) => onDragStart(e, node, { groupIdx, nodeIdx })
                    "
                    class="draggable-menu-node"
                  >
                    {{ node.data.label }}
                  </div>
                </template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
      </div>
    </div>
    <!-- 画布区 -->
    <div class="flow-content">
      <VueFlow
        class="basic-flow"
        v-model:nodes="nodes"
        v-model:edges="edges"
        v-model:selected-nodes="selectedNodes"
        v-model:selected-edges="selectedEdges"
        :selectable="true"
        :nodes-draggable="true"
        :elements-selectable="true"
        :class="{ dark }"
        :default-viewport="{ zoom: 1.1 }"
        :min-zoom="0.2"
        :max-zoom="4"
        :node-types="nodeTypes"
        @drop="onDrop"
        @dragover="onDragOver"
        @connect="onConnect"
        @connect-start="onConnectStart"
        @connect-end="onConnectEnd"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @node-context-menu="onNodeContextMenu"
        @pane-context-menu="onPaneContextMenu"
      >
        <!-- 注册自定义边 -->
        <template #edge-animated="edgeProps">
          <AnimatedEdge
            :id="edgeProps.id"
            :source="edgeProps.source"
            :target="edgeProps.target"
            :source-x="edgeProps.sourceX"
            :source-y="edgeProps.sourceY"
            :targetX="edgeProps.targetX"
            :targetY="edgeProps.targetY"
            :source-position="edgeProps.sourcePosition"
            :target-position="edgeProps.targetPosition"
            :data="edgeProps.data"
          />
        </template>

        <!-- <Background
          :size="1.6"
          pattern-color="	rgba(255,192,203,1.000)"
          bgColor="rgba(238,238,238,0.5)"
          :gap="16"
        /> -->
        <Background
          :size="1.6"
          pattern-color="rgba(53,53,53,1.000)"
          bgColor="rgba(38,38,38,1)"
          :gap="16"
        />
        <!-- <MiniMap /> -->
        <Controls
          class="flow-controls"
          :showFitView="false"
          :showInteractive="false"
          position="top-left"
        >
          <!-- <ControlButton title="Reset Transform" @click="resetTransform">
            <Icon name="reset" />
          </ControlButton>
          <ControlButton title="Shuffle Node Positions" @click="updatePos">
            <Icon name="update" />
          </ControlButton> -->

          <ControlButton title="Toggle Dark Mode" @click="toggleDarkMode">
            <Icon v-if="dark" name="sun" />
            <Icon v-else name="moon" />
          </ControlButton>
          <ControlButton title="Log `toObject`" @click="logToObject">
            <Icon name="log" />
          </ControlButton>
        </Controls>
      </VueFlow>

      <!-- 右键 -->
      <div
        v-if="showNodeContextMenu"
        ref="contextMenuRef"
        class="node-context-menu"
        :style="{
          left: contextMenuPosition.x + 'px',
          top: contextMenuPosition.y + 'px',
        }"
      >
        <!-- <div @click="() => handleNodeMenuAction('edit')" class="menu-item">
          ✏️ 编辑节点
        </div> -->
        <div @click="() => handleNodeMenuAction('delete')" class="menu-item">
          🗑️ 删除节点
        </div>
        <div
          @click="() => handleNodeMenuAction('deleteEdge')"
          class="menu-item"
        >
          🗑️ 删除连线
        </div>
        <!-- 可继续添加其它操作，比如复制、查看详情等 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw, watch, onMounted } from "vue";
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { ControlButton, Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import Icon from "./Icon.vue";
import AnimatedEdge from "./AnimatedEdge.vue"; // 导入自定义动画边组件
import CustomNode from "./CustomNode.vue"; // ← 根据你的路径调整
import LineNodeStartOne from "./LineNodeStartOne.vue";
import LineNodeStartTwo from "./LineNodeStartTwo.vue";
import LineNodeStepOne from "./LineNodeStepOne.vue";
import "@/styles/main.css";
import "@vue-flow/core/dist/style.css";
import { processImage, steps } from "@/api/common";

const emit = defineEmits(["changeTime"]);

const props = defineProps({
  panelWidth: {
    type: Number,
    default: 49.5,
  },
});

const processTime = ref(null);
const nodes = ref([]);
const edges = ref([]);
const selectedNodes = ref([]);
const selectedEdges = ref([]);
const { onInit, addEdges, project, setViewport, toObject, updateEdgeData } =
  useVueFlow();
// ✅ 注册自定义节点类型
const nodeTypes = {
  custom: markRaw(CustomNode), // 关键在这里！ // 'custom' 是在节点数据里用的 type 名称，必须匹配！

  lineNodeStartOne: markRaw(LineNodeStartOne),
  lineNodeStartTwo: markRaw(LineNodeStartTwo),
  LineNodeStepOne: markRaw(LineNodeStepOne),
};
const dark = ref(false);

// 节点库模板
// const nodeTemplates = [
//   {
//     // type: "input",
//     type: "custom",
//     data: { label: "开始", type: "start" },
//     class: "my-custom-node-class",
//     // style: { backgroundColor: "pink", width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤1", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤2", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤3", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤4", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤5", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "default",
//     type: "custom",
//     data: { label: "步骤6", type: "step" },
//     class: "light",
//     // style: { width: "60px", height: "40px" },
//   },
//   {
//     // type: "output",
//     type: "custom",
//     data: { label: "结束", type: "end" },
//     class: "light",
//     // style: { backgroundColor: "pink", width: "60px", height: "40px" },
//   },
// ];

const nodeTemplates = ref([]);
const nodeOne = ref([]);

const showNodeContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const selectedNodeForMenu = ref(null);
const contextMenuRef = ref(null);

//demo 测试
const getSteps = () => {
  nodeOne.value = [
    {
      id: "node-1",
      type: "custom",
      data: {
        stepId: "node-1",
        label: "开始",
        type: "start",
        parentNode: null,
        code: "",
      },
      position: {
        x: 206.09374999999997,
        y: 199.99999999999997,
      },
    },
    {
      id: "node-11",
      type: "lineNodeStartOne",
      data: {
        label: "child node",
        stepId: "node-11",
        type: "start-line",
        parentNode: null,
        switch: false,
        validTarget: "node-21",
        validSource: "node-11",
        code: "console.log(11)",
      },
      extent: "parent",
      position: { x: 30, y: 30 },
      parentNode: "node-1",
    },
    {
      id: "node-12",
      type: "lineNodeStartTwo",
      data: {
        label: "child node2",
        stepId: "node-12",
        type: "start-line",
        parentNode: null,
        code: "console.log(12)",
      },
      extent: "parent",
      position: { x: 30, y: 70 },
      parentNode: "node-1",
    },

    {
      id: "node-2",
      type: "custom",
      data: {
        stepId: "node-2",
        label: "步骤1",
        type: "step",
        parentNode: null,
        code: "",
      },
      position: {
        x: 206.09374999999997,
        y: 199.99999999999997,
      },
    },

    {
      id: "node-21",
      type: "LineNodeStepOne",
      data: {
        label: "child step node",
        stepId: "node-21",
        type: "step-line",
        parentNode: null,
        switch: false,
        validTarget: "node-21",
        validSource: "node-11",
        code: "console.log(21)",
      },
      extent: "parent",
      position: { x: 30, y: 30 },
      parentNode: "node-2",
    },
  ];

  nodeTemplates.value = [
    {
      groupName: "测试集合1", // 一级菜单名称
      nodes: nodeOne.value.map((step) => ({
        type: step.type,
        data: {
          stepId: step.id,
          label: step.data.label,
          type: step.data.type,
          parentNode: step.parentNode || null,
        },
      })),
    },
    // {
    //   groupName: "测试集合2", // 一级菜单名称
    //   nodes: res.map((step) => ({
    //     type: "custom",
    //     data: { stepId: step.id, label: step.data.label, type: "step" },
    //   })),
    // },
  ];
  console.log(nodeTemplates.value);
};

// 拖拽开始时，记录拖拽的节点类型
const onDragStart = (event, template, idx) => {
  event.dataTransfer.setData(
    "application/vueflow",
    JSON.stringify({ ...template, idx })
  );
  event.dataTransfer.effectAllowed = "move";
};

// 拖拽放置
const onDrop = (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData("application/vueflow");
  if (!data) return;
  const template = JSON.parse(data);
  console.log(template);

  // const canvas = document.getElementById('flowchart-canvas')
  // const rect = canvas.getBoundingClientRect()

  // 计算节点位置
  const rect = event.currentTarget.getBoundingClientRect();
  const position = project({
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  });

  // const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // nodes.value.push({
  //   ...template,
  //   id,

  //   position,
  // });

  let arr = nodeOne.value.filter((item) => {
    return (
      item.id === template.data.stepId ||
      item.parentNode == template.data.stepId
    );
  });

  console.log(arr);

  // nodes.value = [
  //   {
  //     id: "node-1",
  //     type: "custom",
  //     data: {
  //       stepId: "node-1",
  //       label: "开始",
  //       type: "start",
  //       parentNode: null,
  //     },
  //     position: {
  //       x: 206.09374999999997,
  //       y: 199.99999999999997,
  //     },
  //   },
  //   {
  //     id: "node-11",
  //     type: "lineNodeStartOne",
  //     data: {
  //       label: "child node",
  //       stepId: "node-11",
  //       type: "start-line",
  //       parentNode: null,
  //       switch: false,
  //     },
  //     extent: "parent",
  //     position: { x: 30, y: 30 },
  //     parentNode: "node-1",
  //   },
  //   {
  //     id: "node-12",
  //     type: "lineNodeStartTwo",
  //     data: {
  //       label: "child node2",
  //       stepId: "node-12",
  //       type: "start-line",
  //       parentNode: null,
  //     },
  //     extent: "parent",
  //     position: { x: 30, y: 70 },
  //     parentNode: "node-1",
  //   },
  // ];
  nodes.value.push(...arr);
  console.log(nodes.value);
};

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

// 创建连线时使用我们的自定义动画边;
const onConnect = (connection) => {
  console.log(connection);
  // 生成唯一ID
  const edgeId = `edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  addEdges({
    ...connection,
    id: edgeId,
    type: "animated",
    animated: true, // 这是我们的自定义边组件类型标识
    // markerEnd: {
    //   type: MarkerType.ArrowClosed, // 保持箭头
    //   width: 20,
    //   height: 20,
    //   color: "#6b7280",
    // },
    data: {
      startAnimation: false,
      onAnimationStart: (value) => {
        // 更新边数据，重置动画触发状态
        updateEdgeData(edgeId, { startAnimation: value });
      },
    },
  });
};

const onConnectStart = ({ nodeId, handleType }) => {
  console.log("on connect start", { nodeId, handleType });
};

const onConnectEnd = (event) => {
  console.log("on connect end", event);
};

// 开始流程动画
const startFlowAnimation = () => {
  // 构建节点连接关系
  const edgeMap = {};
  edges.value.forEach((edge) => {
    edgeMap[edge.source] = edge.id;
  });

  // 找到起始节点
  const allTargets = edges.value.map((e) => e.target);
  const startNode = nodes.value.find((n) => !allTargets.includes(n.id));

  if (!startNode) {
    alert("请先创建完整的流程，包含开始和结束节点");
    return;
  }

  // 按顺序触发每条边的动画
  let currentNodeId = startNode.id;
  const animateNextEdge = () => {
    const edgeId = edgeMap[currentNodeId];
    if (!edgeId) return;

    // 触发当前边的动画
    updateEdgeData(edgeId, { startAnimation: true });

    // 找到下一个节点
    const nextEdge = edges.value.find((e) => e.id === edgeId);
    if (nextEdge) {
      currentNodeId = nextEdge.target;
      // 等待当前动画完成后再开始下一个
      setTimeout(animateNextEdge, 1500);
    }
  };

  // 开始动画序列
  animateNextEdge();
};

// 其他原有方法保持不变...
const deleteSelectedNode = () => {
  const selectedIds = selectedNodes.value.map((n) =>
    typeof n === "string" ? n : n.id
  );
  nodes.value = nodes.value.filter((node) => !selectedIds.includes(node.id));
  edges.value = edges.value.filter(
    (edge) =>
      !selectedIds.includes(edge.source) && !selectedIds.includes(edge.target)
  );
  selectedNodes.value = [];
};

const deleteSelectedEdge = () => {
  const selectedIds = selectedEdges.value.map((e) =>
    typeof e === "string" ? e : e.id
  );
  edges.value = edges.value.filter((edge) => !selectedIds.includes(edge.id));
  selectedEdges.value = [];
};

const deleteSelectedAllEdge = () => {
  const nodeId = selectedNodeForMenu.value.id;
  console.log(`  准备删除与节点 [${nodeId}] 相连的所有连线`);
  edges.value = edges.value.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId
  );
  console.log(`  已删除与节点 [${nodeId}] 相连的所有连线`);
  // 可选：清除选中状态
  selectedEdges.value = [];
  selectedNodes.value = [];
};

onInit((vueFlowInstance) => {
  vueFlowInstance.fitView();
});

const updatePos = () => {
  nodes.value = nodes.value.map((node) => ({
    ...node,
    position: {
      x: Math.random() * 400,
      y: Math.random() * 400,
    },
  }));
};

const logToObject = () => {
  console.log(toObject());
};

const resetTransform = () => {
  setViewport({ x: 0, y: 0, zoom: 1 });
};

const toggleDarkMode = () => {
  dark.value = !dark.value;
};

const exportFlowJSON = () => {
  // 1. 收集所有节点和边
  const allNodes = nodes.value;
  const allEdges = edges.value;

  console.log(nodes.value);
  console.log(edges.value);
  // 1. 建立 id -> 完整节点对象 的映射
  const idToNodeMap = new Map();
  nodeOne.value.forEach((node) => {
    idToNodeMap.set(node.id, node);
  });

  // 2. 遍历 edges，每条边生成一个流程（即 [sourceNode, targetNode]）
  const flowsArray = edges.value
    .map((edge) => {
      const sourceNode = idToNodeMap.get(edge.source);
      const targetNode = idToNodeMap.get(edge.target);

      if (!sourceNode) {
        console.warn(`未找到 source 节点，id = ${edge.source}`, edge);
        return null;
      }
      if (!targetNode) {
        console.warn(`未找到 target 节点，id = ${edge.target}`, edge);
        return null;
      }

      // 每条边对应一条流程：[来源节点对象, 目标节点对象]
      return [sourceNode, targetNode];
    })
    .filter(Boolean); // 过滤掉无效边

  console.log("流程数组（每条流程是 [sourceNode, targetNode]）：", flowsArray);

  //  遍历每一条流程（
  flowsArray.forEach((flow, index) => {
    const [sourceNode, targetNode] = flow;

    console.log(
      `\n🔁 正在执行第 ${index + 1} 条流程：source=${sourceNode.id} → target=${
        targetNode.id
      }`
    );

    //   执行 sourceNode 的 code（如果存在且是字符串）
    if (sourceNode.data?.code && typeof sourceNode.data.code === "string") {
      console.log(
        `  执行 source 节点 [${sourceNode.id}] 的代码:`,
        sourceNode.data.code
      );
      try {
        new Function(sourceNode.data.code)();
      } catch (err) {
        console.error(`  source 节点 [${sourceNode.id}] 的代码执行失败:`, err);
      }
    }

    //  执行 targetNode 的 code（如果存在且是字符串）
    if (targetNode.data?.code && typeof targetNode.data.code === "string") {
      console.log(
        `  执行 target 节点 [${targetNode.id}] 的代码:`,
        targetNode.data.code
      );
      try {
        new Function(targetNode.data.code)();
      } catch (err) {
        console.error(`  target 节点 [${targetNode.id}] 的代码执行失败:`, err);
      }
    }
  });
};

// 点击节点时触发
const onNodeClick = (event) => {
  console.log(event.node);
  const nodeId = event.node.id;
  selectedNodes.value = [event.node.id];
  // 遍历所有节点，对每一个节点都重新设置 data.isSelected
  nodes.value = nodes.value.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isSelected: node.id === nodeId, // ✅ 当前节点为 true，其它节点为 false
    },
  }));
};
// const onEdgeClick=(params)=> {
//   console.log(params);
//   selectedEdges.value = [params.edge.id];
// }

const onEdgeClick = (event) => {
  console.log(event.edge);
  const edgeId = event.edge.id;
  selectedEdges.value = [event.edge.id];

  // 更新 edges，设置被点击的边的 data.isSelected 或 data.color
  edges.value = edges.value.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      isSelected: edge.id === edgeId, // 标记是否被点击
      // 或者直接设置颜色
      // color: edge.id === edgeId ? '#ff0000' : undefined,
    },
  }));
};

//清空
const clearSelectedNode = () => {
  nodes.value = [];
  edges.value = [];
  exportFlowJSON();
};

// 右键点击节点时触发
const onNodeContextMenu = (event) => {
  event.event.preventDefault(); // 阻止系统右键菜单
  const node = event.node; // 当前被右键的节点对象
  console.log("右键点击的节点是：", node);
  selectedNodes.value = [node.id];
  // // 设置要显示的菜单数据
  selectedNodeForMenu.value = node; // 可以存起来供菜单使用
  contextMenuPosition.value.x = event.event.clientX;
  contextMenuPosition.value.y = event.event.clientY;
  showNodeContextMenu.value = true; // 控制菜单显示
};

// 右键点击画布空白处时触发
const onPaneContextMenu = (event) => {
  console.log(event);
  // event.event.preventDefault();
  console.log("右键点击了画布空白处");
  showNodeContextMenu.value = false;

  // 在鼠标位置显示 "添加节点" 菜单，或直接添加一个默认节点
};

// 菜单操作示例
const handleNodeMenuAction = (action) => {
  if (!selectedNodeForMenu.value) return;

  const nodeId = selectedNodeForMenu.value.id;

  console.log(`对节点 [${nodeId}] 执行操作:`, action);

  if (action === "delete") {
    // 删除该节点
    deleteSelectedNode();
  } else if (action === "edit") {
    // 编辑节点逻辑
    console.log(`编辑节点: ${selectedNodeForMenu.value.data.label}`);
  } else if (action === "deleteEdge") {
    deleteSelectedAllEdge();
  }

  // 关闭菜单
  showNodeContextMenu.value = false;
};

//
// 监听全局点击，点击其他地方关闭菜单
const handleGlobalClick = (event) => {
  if (!showNodeContextMenu.value) return;

  if (contextMenuRef.value && !contextMenuRef.value.contains(event.target)) {
    showNodeContextMenu.value = false;
  }
};

const handleMenuSelect = () => {};

watch(
  () => nodes.value,
  (node) => {
    console.log("nodes改变了:", node);
  }
);
onMounted(() => {
  getSteps();
});
</script>

<style lang="scss" scoped>
.flow-container {
  display: flex;
  height: 100vh;
  width: 100%; // 使用 100%，通过父级控制实际宽度
  box-sizing: border-box;
}

.flow-menu {
  width: 10vw;
  background: #f5f5f7;
  border: 1px solid pink;
}

.delete-btn {
  width: 120px;
  height: 50px;
  line-height: 50px;
  margin: 3px 0;
  cursor: pointer;
  background: #dc3545;
  color: white;
  font-size: 20px;
  border: 1px solid #dc3545;
  border-radius: 8px;

  &:hover {
    background: #c82333;
  }
}
.export-btn {
  width: 120px;
  height: 50px;
  line-height: 50px;
  margin: 3px 0;
  cursor: pointer;
  background: #28a745;
  border: 1px solid #28a745;
  border-radius: 8px;
  color: white;
  font-size: 20px;

  &:hover {
    background: #218838;
  }
}

.flow-content {
  height: 100vh;
  width: calc(100% - 10vw); // 菜单占10vw，画布占剩余部分
  border: 1px solid pink;
  box-sizing: border-box;
}

// .node-templates-container {
//   margin-top: 15px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   /* border: 1px solid red; */
// }
// .node-template {
//   margin-bottom: 4px;
//   padding: 8px;
//   background: #fff;
//   border: 1px solid #ddd;
//   cursor: grab;
//   width: 120px;
//   height: 60px;
//   border-radius: 10px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   span {
//     display: inline-block;
//     // background-color: red;
//   }
// }

// .node-template:hover {
//   background: #e3eafa;
// }

// 菜单样式
.node-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  padding: 4px 0;
}

.node-context-menu .menu-item {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.node-context-menu .menu-item:hover {
  background-color: #f0f0f0;
}

//menu
.node-templates-container {
  // border: 1px solid red;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 70vh;
  padding: 20px 0;
  .node-templates-border {
    width: 9vw;
    height: 100%;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 12px;
    background: #fafafa;

    // 滚动条样式隐藏
    // overflow-y: auto;
    // scrollbar-width: none;
    // -ms-overflow-style: none;

    //单独设置滚动条样式
    overflow-y: auto; /* 显示垂直滚动条 */
    /* 对于 Firefox 的基础设置 */
    scrollbar-width: thin; /* 滚动条宽度：auto/thin/none */
    scrollbar-color: #4a90e2 #f0f0f0; /* 滑块颜色 轨道颜色 */

    /* WebKit 浏览器滚动条样式 (Chrome, Safari, Edge) */

    /* 滚动条整体 */
    ::-webkit-scrollbar {
      width: 8px; /* 滚动条宽度 */
      height: 8px; /* 水平滚动条高度 */
    }

    /* 滚动条轨道 */
    ::-webkit-scrollbar-track {
      background: #f0f0f0; /* 轨道背景色 */
      border-radius: 4px; /* 轨道圆角 */
    }

    /* 滚动条滑块 */
    ::-webkit-scrollbar-thumb {
      background-color: #4a90e2; /* 滑块颜色 */
      border-radius: 4px; /* 滑块圆角 */
      border: 2px solid transparent; /* 透明边框，用于控制滑块与轨道的间距 */
      background-clip: content-box; /* 确保背景色只填充内容区域，不包括边框 */
    }

    /* 滚动条滑块悬停状态 */
    ::-webkit-scrollbar-thumb:hover {
      background-color: #357abd; /* 悬停时的滑块颜色 */
    }

    /* 滚动条滑块激活状态（点击时） */
    ::-webkit-scrollbar-thumb:active {
      background-color: #286090; /* 激活时的滑块颜色 */
    }

    /* 滚动条角落（水平和垂直滚动条交汇处） */
    ::-webkit-scrollbar-corner {
      background: #f0f0f0; /* 角落背景色 */
    }
  }
}

.menu-title {
  border: 1px solid red;
  // margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.node-menu {
  border: none;
  background: transparent;
  :deep(.el-menu-item) {
    background: transparent;
    border: none;
    height: auto;
    line-height: normal;
    padding: 6px 12px;
    &.is-active {
      background-color: #ecf5ff;
      color: #409eff;
    }
  }
}

.menu-item-wrapper {
  // border: 1px solid red !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.menu-item-wrapper-none {
  display: none;
}

.draggable-menu-node {
  cursor: grab;
  padding: 8px 00px;
  border-radius: 4px;
  background: white;
  border: 1px solid #dcdfe6;
  // text-align: center;
  width: 7vw !important;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    background-color: #f0f9ff;
    border-color: #409eff;
  }
}

.el-sub-menu {
  background-color: #28a745 !important;
  margin-bottom: 10px !important;
  border-radius: 6px !important;
}

.el-sub-menu:hover {
  background-color: #218838 !important;
  border-radius: 6px !important;
}

:deep(.el-sub-menu__title) {
  color: #ffffff !important;
  font-weight: bold;
  border-radius: 6px !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #218838 !important;
  border-radius: 6px !important;
}

// .flow-controls .vue-flow__controls-button {
//   width: 100px;
//   height: 100px;
// }

/* 假设你的父组件样式中，为自定义节点添加以下规则 */
.basic-flow {
  pointer-events: auto !important; /* 确保节点内部元素可交互 */
}
</style>
