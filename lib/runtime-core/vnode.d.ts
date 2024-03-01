/// <reference types="./src/global.d.ts" />
export declare const Fragment: unique symbol;
export declare const Text: unique symbol;
export declare function createVNode(type: any, props?: any, children?: any): VNode;
export declare function createTextVNode(text: string): VNode;
