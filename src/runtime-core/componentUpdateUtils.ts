export function shouldUpdateComponent(prev: VNode, vnode: VNode) {
  const { props: prevProps } = prev;
  const { props: nextProps } = vnode;
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
