import { NodeType } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root: any, options = {}) {
  const context = createTransformContext(root, options); // 创建context
  traverseNode(root, context); // 遍历节点，应用transform
  createRootCodegen(root); // 为ast树对象设置代码生成根节点
  root.helpers = [...context.helpers.keys()]; // 解构出所有的helperKey
}
/**
 * create TransformContext
 * @param root
 * @param options
 * @returns
 */
function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    /**
     * 为helpers添加一个helperAPI key
     * @param key
     */
    helper(key: symbol) {
      context.helpers.set(helperMapName[key], 1);
    },
  };
  return context;
}
/**
 * 遍历节点,执行context中包含的transform
 * @param node
 * @param context
 */
function traverseNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transformFunc = nodeTransforms[i];
    transformFunc(node, context);
  }
  switch (node.type) {
    case NodeType.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeType.ROOT:
    case NodeType.ELEMENT:
      traverseChildren(node, context);
      break;
    default:
      break;
  }
}
/**
 * 遍历子节点
 * @param node
 * @param context
 */
function traverseChildren(node: any, context: any) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}
/**
 * 设置生成代码的入口节点
 * @param root
 */
function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeType.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = child;
  }
}
