import { createVnodeCall, NodeType } from "./ast";
import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export function transformElement(node: any, context: any) {
  if (node.type === NodeType.ELEMENT) {
    return () => {
      context.helper(CREATE_ELEMENT_VNODE);

      // middle layer
      const vnodeTag = `"${node.tag}"`;

      // props
      let vnodeProps;

      // children
      const children = node.children;
      let vnodeChildren = children;

      // update node.codegenNode
      node.codegenNode = createVnodeCall(vnodeTag, vnodeProps, vnodeChildren);
    };
  }
}
