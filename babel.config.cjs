module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      './jest/babel-plugin-transform-import-meta.cjs',
      {
        helperName: '__importMeta__',
      },
    ],
  ],
}



