import { NodeType } from "../ast";
import { baseParser } from "../parser";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple", () => {
      const ast = baseParser("   {{message}}  ");
      //root
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.INTERPOLATION,
        content: {
          type: NodeType.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });

    test("parse element", () => {
      const ast = baseParser("<div></div>aaaa");
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: "div",
        children: [],
      });
    });

    test("parse text", () => {
      const ast = baseParser("some text");
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.TEXT,
        content: "some text",
      });
    });

    test("multiple text", () => {
      const ast = baseParser("<p>hi,{{message}}</p>");
      console.log(ast.children[0].children);
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: "p",
        children: [
          { type: NodeType.TEXT, content: "hi," },
          {
            type: NodeType.INTERPOLATION,
            content: {
              type: NodeType.SIMPLE_EXPRESSION,
              content: "message",
            },
          },
        ],
      });
    });
  });
});
