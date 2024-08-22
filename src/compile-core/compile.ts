import { generator } from "./codegen";
import { baseParse } from "./parser";
import { transform } from "./transform";
import { transformExpression } from "./transformExpression";
import { TransformText } from "./transformText";
import { transformElement } from "./trasnformElement";

/**
 * compile 入口函数
 * @param template 
 * @returns 
 */
export function baseCompile(template:any) {
  const ast = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, TransformText],
  });
  return generator(ast);
}
