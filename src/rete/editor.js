import { createRoot } from "react-dom/client";
import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin } from "rete-connection-plugin";
import { ReactPlugin, Presets } from "rete-react-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets
} from "rete-auto-arrange-plugin";
import { DataflowEngine, ControlFlowEngine } from "rete-engine";
import {
  ContextMenuPlugin,
  Presets as ContextMenuPresets
} from "rete-context-menu-plugin";

const socket = new ClassicPreset.Socket("socket");

class Start extends ClassicPreset.Node {
  width = 180;
  height = 90;

  constructor() {
    super("Start");
    this.addOutput("exec", new ClassicPreset.Output(socket, "Exec"));
  }

  execute(_, forward) {
    forward("exec");
  }

  data() {
    return {};
  }
}

// 修复Log类：确保log函数正确挂载
class Log extends ClassicPreset.Node {
  width = 180;
  height = 150;

  // 构造函数明确接收log和dataflow，并绑定到this
  constructor(logFunc, dataflow) {
    super("Log");
    // 强制校验logFunc必须是函数，否则抛出错误
    if (typeof logFunc !== "function") {
      throw new Error("创建Log节点失败：必须传入一个log函数");
    }
    // 用更明确的变量名避免混淆（this.logFunc）
    this.logFunc = logFunc; 
    this.dataflow = dataflow;

    this.addInput("exec", new ClassicPreset.Input(socket, "Exec", true));
    this.addInput("message", new ClassicPreset.Input(socket, "Text"));
    this.addOutput("exec", new ClassicPreset.Output(socket, "Exec"));
  }

  async execute(input, forward) {
    const inputs = await this.dataflow.fetchInputs(this.id);
    // 调用绑定好的logFunc
    this.logFunc((inputs.message && inputs.message[0]) || "");
    forward("exec");
  }

  data() {
    return {};
  }
}

class TextNode extends ClassicPreset.Node {
  height = 120;
  width = 180;

  constructor(initial) {
    super("Text");
    this.addControl(
      "value",
      new ClassicPreset.InputControl("text", { initial })
    );
    this.addOutput("value", new ClassicPreset.Output(socket, "Number"));
  }

  execute() {}

  data() {
    return {
      value: this.controls.value.value || ""
    };
  }
}

class Connection extends ClassicPreset.Connection {}

export async function createEditor(container, logFunc) {
  // 先校验传入的logFunc是否有效
  if (typeof logFunc !== "function") {
    throw new Error("createEditor失败：第二个参数必须是函数（logFunc）");
  }

  const editor = new NodeEditor();
  const area = new AreaPlugin(container);
  const connection = new ConnectionPlugin();
  const render = new ReactPlugin({ createRoot });
  const arrange = new AutoArrangePlugin();
  const dataflow = new DataflowEngine(({ inputs, outputs }) => {
    return {
      inputs: () => Object.keys(inputs).filter(name => name !== "exec"),
      outputs: () => Object.keys(outputs).filter(name => name !== "exec")
    };
  });
  const engine = new ControlFlowEngine(() => {
    return {
      inputs: () => ["exec"],
      outputs: () => ["exec"]
    };
  });
  const contextMenu = new ContextMenuPlugin({
    items: ContextMenuPresets.classic.setup([
      ["Start", () => new Start()],
      // 确保上下文菜单中创建Log节点时传入正确的logFunc和dataflow
      ["Log", () => new Log(logFunc, dataflow)], 
      ["Text", () => new TextNode("")]
    ])
  });
  area.use(contextMenu);

  arrange.addPreset(ArrangePresets.classic.setup());

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  });

  render.addPreset(Presets.contextMenu.setup());
  render.addPreset(Presets.classic.setup());

  editor.use(engine);
  editor.use(dataflow);
  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  AreaExtensions.simpleNodesOrder(area);
  AreaExtensions.showInputControl(area);

  // 初始化节点时传入正确的logFunc
  const start = new Start();
  const text1 = new TextNode("log");
  const log1 = new Log(logFunc, dataflow); // 这里传入logFunc

  const con1 = new Connection(start, "exec", log1, "exec");
  const con2 = new Connection(text1, "value", log1, "message");

  await editor.addNode(start);
  await editor.addNode(text1);
  await editor.addNode(log1);

  await editor.addConnection(con1);
  await editor.addConnection(con2);

  setInterval(() => {
    dataflow.reset();
    engine.execute(start.id);
  }, 1000);

  await arrange.layout();
  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy()
  };
}