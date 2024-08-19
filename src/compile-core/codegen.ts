import { NodeType } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";
import { transformExpression } from "./transformExpression";

export function generator(ast: any) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context); // 生成前导码

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}){`);
  const node = ast.codegenNode; // 代码生成入口节点
  genNode(node, context);
  push("}");
  return { code: context.code };
}
function genFunctionPreamble(ast: any, context: any) {
  const { push } = context;
  const VueBinding = "vue";
  const aliasHelper = (s: string) => `${s}:_${s}`;
  // resolve helpers

  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(",")} } = ${VueBinding};\n`
    );
  }
  push("return ");
}

/**
 * 创建context对象
 * @returns Context
 */
function createCodegenContext() {
  const context = {
    code: "",
    push(source: string) {
      context.code += source;
    },
    helper(key:any) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
/**
 * 将node.content 添加到context
 * @param node
 * @param context
 */
function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeType.TEXT:
      genText(node, context);
      break;
    case NodeType.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeType.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
  }
}
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(helper(TO_DISPLAY_STRING));  
  push("(")
  genNode(node.content, context);
  push(")");
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
