import { NodeType } from "./ast";

/**
 * 这是一条transform
 * @param node
 */
export function transformExpression(node: any) {
  console.log("!!!", node);
  if (node.type === NodeType.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}
/**
 * 给node.content加上_ctx
 * @param node
 * @returns
 */
function processExpression(node: any) {
  node.content = "_ctx." + node.content;
  return node;
}
