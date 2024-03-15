import { getSequence } from "src/share";
describe("getConsequence", () => {
  it("should return a consequence", () => {
    let x = getSequence([4, 2, 3]);
    console.log(x);
    expect(x).toEqual([2, 3]);
  });
});
