/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:32:21
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-06 14:44:32
 * @FilePath: \my_mini_vue\src\index.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
export * from "./runtime-dom";
export * from "./reactivity";

import { baseCompile } from "./compile-core";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";

function compileToFunction(template: any) {
  const { code } = baseCompile(template);
  const render = new Function("vue", code)(runtimeDom);
  return render;
  //   function renderFunction() {
  //     const {
  //       toDisplayString: _toDisplayString,
  //       openBlock: _openBlock,
  //       createElementVnode: _createElementVnode,
  //     } = vue;

  //     return function render(
  //       _ctx: any,
  //       _cache: any,
  //       $props: any,
  //       $setup: any,
  //       $data: any,
  //       $options: any
  //     ) {
  //       return (
  //         _openBlock(),
  //         _createElementVnode(
  //           "div",
  //           null,
  //           "hi, " + _toDisplayString(_ctx.message),
  //           1
  //         )
  //       );
  //     };
  //   }
}

registerRuntimeCompiler(compileToFunction);
