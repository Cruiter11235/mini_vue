import { generator } from "../codegen";
import { baseParse } from "../parser";
import { transform } from "./../transform";

describe("codegen", () => {
  it("string", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generator(ast);
    // 快照(string)
    // 1. 抓bug
    // 2. 有意()
    expect(code).toMatchSnapshot();
  });
});
