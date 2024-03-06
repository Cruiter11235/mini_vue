import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: "json" };
import dts from "rollup-plugin-dts";
import { defineConfig } from "rollup";
export default defineConfig(
  {
    type: "module",
    input: "./src/index.ts",
    output: [
      {
        format: "cjs",
        file: pkg.main,
      },
      {
        format: "es",
        file: pkg.module,
      },
    ],
    plugins: [typescript(), json()],
  }
);
