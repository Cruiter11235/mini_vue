import { NodeType } from "./ast";

export function isText(node: any) {
  return node.type == NodeType.TEXT || node.type === NodeType.INTERPOLATION;
}
