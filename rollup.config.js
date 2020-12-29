import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/korean-app.js',
  output: { file: 'app.js',format: 'iife' },
  plugins: [nodeResolve(),terser()]
}