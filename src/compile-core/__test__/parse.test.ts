import { NodeType } from "../ast";
import { baseParse } from "../parser";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{ message  }}");
      expect(ast.children[0]).toStrictEqual({
        type: "interpolation",
        content: {
          type: "simple_expression",
          content: "message",
        },
      });
    });
  });

  describe("element", () => {
    it("simple element div", () => {
      const ast = baseParse("<div></div>");
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: "div",
        children: [],
      });
    });
  });

  describe("text", () => {
    it("simple text", () => {
      const ast = baseParse("some text");
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.TEXT,
        content: "some text",
      });
    });
  });

  test("complex template", () => {
    const ast = baseParse("<p>hi,{{message}}</p>");
    expect(ast.children[0]).toStrictEqual({
      type: NodeType.ELEMENT,
      tag: "p",
      children: [
        {
          type: NodeType.TEXT,
          content: "hi,",
        },
        {
          type: NodeType.INTERPOLATION,
          content: {
            type: "simple_expression",
            content: "message",
          },
        },
      ],
    });
  });

  test("recursive template", () => {
    const ast = baseParse("<div><p>hi</p>{{message}}</div>");
    expect(ast.children[0]).toStrictEqual({
      type: NodeType.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeType.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeType.TEXT,
              content: "hi",
            },
          ],
        },
        {
          type: NodeType.INTERPOLATION,
          content: {
            type: "simple_expression",
            content: "message",
          },
        },
      ],
    });
  });

  test("lost end tag", () => {
    expect(() => {
      baseParse("<div><span></div>");
    }).toThrow("缺少结束标签");

    baseParse("<html><div>1233</div></html>");
  });
});
