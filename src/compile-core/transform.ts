import { NodeType } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root: any, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  createRootCodegen(root);
  root.helpers = [...context.helpers.keys()]; // 解构出所有的helperKey
}
/**
 * create context
 * @param root
 * @param options
 * @returns
 */
function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key: string) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}
/**
 * 遍历节点
 * @param node
 * @param context
 */
function traverseNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transformFunc = nodeTransforms[i];
    transformFunc(node);
  }
  switch (node.type) {
    case NodeType.INTERPOLATION:
      context.helper(helperMapName[TO_DISPLAY_STRING]);
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
  root.codegenNode = root.children[0];
}
