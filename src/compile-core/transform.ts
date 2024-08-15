import { NodeType } from "./ast";

export function transform(root: any, options = {}) {
  // create context
  const context = createTransformContext(root, options);
  // 1.遍历-深度优先搜索
  traverseNode(root, context);

  createRootCodegen(root);
  // root.childrenNode
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
    const transform = nodeTransforms[i];
    transform(node);
  }
  traverseChildren(node, context);
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
function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}
