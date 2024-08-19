import { NodeType } from "./ast";

/**
 * 这是一条transform
 * @param node
 */
export function transformExpression(node: any) {
  if (node.type === NodeType.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}

function processExpression(node: any) {
  node.content = "_ctx." + node.content;
  return node;
}
