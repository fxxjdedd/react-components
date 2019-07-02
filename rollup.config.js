// https://chenshenhai.github.io/rollupjs-note/note/chapter06/02.html
const path = require('path');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const resolve = require('rollup-plugin-node-resolve');
const notify = require('rollup-plugin-notify');
const progress = require('rollup-plugin-progress');

function resolveFile(filePath) {
  return path.join(__dirname, filePath);
}

const babelOptions = {
  exclude: '**/node_modules/**',
  presets: [
    [
      '@babel/env',
      {
        modules: false,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-external-helpers',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-react-jsx',
  ],
};

const globals = {
  antd: 'antd',
  react: 'react',
};

module.exports = [
  {
    input: resolveFile('components/index.ts'),
    output: [
      {
        name: 'es',
        format: 'es',
        file: 'es/index.js',
        globals,
      },
      {
        name: 'umd',
        format: 'umd',
        file: 'lib/index.js',
        globals,
      },
    ],
    external: ['antd', 'react'],
    plugins: [
      resolve(),
      typescript(), // 有tsconfig.json的paths就不需要alias插件了
      babel(babelOptions),
      commonjs(),
      postcss({
        extract: true,
        minimize: true,
        extensions: ['.css', '.scss'],
        plugins: [autoprefixer],
      }),
      notify(),
      progress(),
      // uglify(),
    ],
  },
];
