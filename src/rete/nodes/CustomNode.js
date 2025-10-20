// src/rete/nodes/CustomNode.js
import { NodeEditor, ClassicPreset } from 'rete'; // 只从 rete 导入这两个核心成员
import CustomNodeVue from "@/components/flow/CustomNode.vue";

// 正确解构所有需要的类（包括 Component）
const { Node, Socket, Input, Output, Component } = ClassicPreset;

/**
 * 自定义节点逻辑类（继承 ClassicPreset.Node）
 */
export class CustomNode extends Node {
  constructor(label, initialValue = "") {
    super(label);
    this.data = {
      label: label,
      value: initialValue
    };
    this.size = { width: 180, height: 100 };
  }
}

/**
 * 自定义节点组件类（继承 ClassicPreset.Component）
 */
export class CustomNodeComponent extends Component { // 这里继承的是 ClassicPreset 的 Component
  constructor() {
    super("custom-node"); // 节点类型标识（唯一）
  }

  // 定义节点的输入/输出端口
  async builder(node) {
    const socket = new Socket("socket"); // 使用 ClassicPreset 的 Socket

    // 添加输入端口
    node.addInput(
      "input",
      new Input(socket, "输入", { multiple: false }) // 使用 ClassicPreset 的 Input
    );

    // 添加输出端口
    node.addOutput(
      "output",
      new Output(socket, "输出", { multiple: true }) // 使用 ClassicPreset 的 Output
    );
  }

  // 节点数据处理逻辑
  worker(node, inputs, outputs) {
    outputs["output"] = inputs["input"]?.[0] || node.data.value;
  }
}

/**
 * 安装自定义节点到编辑器
 * @param {NodeEditor} editor - Rete 编辑器实例
 */
export function install(editor) {
  // 注册节点组件
  editor.register(new CustomNodeComponent());
  // 关联 Vue 渲染组件
  editor.vueContext.components.set("custom-node", CustomNodeVue);
}