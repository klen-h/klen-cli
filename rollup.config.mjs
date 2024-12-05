import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'cli.js',
  output: {
    file: 'dist/cli-bundle.js',
    format: 'cjs'
  },
  plugins: [
    nodeResolve({
      preferBuiltins: false // 禁用首选内置模块的行为
    }),
    commonjs(),
    json()
  ]
};