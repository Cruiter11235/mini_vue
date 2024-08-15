export function generator(ast: any) {
  const context = createCodegenContext();
  const { push } = context;
  push("return ");
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}){`);
  const node = ast.codegenNode; // 代码生成入口节点
  genNode(node,context);
  push("}");
  return { code: context.code };
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source: string) {
      context.code += source;
    },
  };
  return context;
}

function genNode(node: any, context:any) {
  const { push } = context;
  push(`return '${node.content}'`);
}
