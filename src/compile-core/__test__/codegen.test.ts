import { generator } from "../codegen";
import { baseParse } from "../parser";
import { transform } from "./../transform";
import { transformExpression } from "./../transformExpression";
import { transformElement } from "./../trasnformElement";
import { TransformText } from "./../transformText";

describe("codegen", () => {
  it("string", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generator(ast);
    expect(code).toMatchSnapshot();
  });
  it("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generator(ast);
    expect(code).toMatchSnapshot();
  });
  it("element", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    transform(ast, {
      nodeTransforms: [transformExpression, TransformText, transformElement],
    });
    const { code } = generator(ast);
    expect(code).toMatchSnapshot();
  });
});
