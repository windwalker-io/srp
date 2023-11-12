import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import esbuild, { minify } from 'rollup-plugin-esbuild';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// @see https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226
export default [
  buildConfig('client', 'SRPClient'),
  buildConfig('server', 'SRPServer'),
  buildConfig('srp', 'SRP'),
  {
    input: 'src/srp.ts',
    output: {
      file: 'types/srp.d.ts',
      format: 'es',
    },
    plugins: [
      dts()
    ]
  }
];

function buildConfig(type, umdName) {
  return {
    input: `src/${type}.ts`,
    output: [
      {
        file: `dist/${type}.cjs`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/${type}.js`,
        format: 'umd',
        sourcemap: true,
        name: umdName,
      },
      {
        file: `dist/${type}.mjs`,
        format: 'esm',
        sourcemap: true,
      },
      ...(process.env.NODE_ENV === 'production'
        ? [
          {
            file: addMinToFilename(`dist/${type}.js`),
            format: 'esm',
            sourcemap: true,
            name: umdName,
            plugins: [
              minify(),
            ]
          },
          {
            file: addMinToFilename(`dist/${type}.mjs`),
            format: 'es',
            sourcemap: true,
            plugins: [
              minify(),
            ]
          }
        ]
        : [])
    ],
    plugins: [
      nodeResolve(),
      typescript()
    ]
  };
}

function addMinToFilename(fileName) {
  return fileName.replace(/.js$/, '.min.js');
}
