import { NodeType } from "./ast";
import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export function transformElement(node: any, context: any) {
  if (node.type === NodeType.ELEMENT) {
    context.helper(CREATE_ELEMENT_VNODE);

    // middle layer
    const vnodeTag = node.tag;

    // props
    let vnodeProps;

    // children
    const children = node.children;
    let vnodeChildren = children[0];

    const vnodeElement = {
      type: NodeType.ELEMENT,
      tag: vnodeTag,
      props: vnodeProps,
      children: vnodeChildren,
    };

    node.codegenNode = vnodeElement;
  }
}
