const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const pkgExists = fs.existsSync(path.resolve(__dirname, '../pkg'));

console.log('Build mode:', isProduction ? 'production' : 'development');
console.log('PKG directory exists:', pkgExists);
console.log('VERCEL environment:', !!process.env.VERCEL);

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/'
  },
  mode: isProduction ? 'production' : 'development',
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './index.html', to: './' },
        { from: './style.css', to: './' },
        { from: './sp1-bridge.js', to: './' },
        { from: './assets', to: './assets' },
        // Copy pre-built WASM files if they exist
        ...(pkgExists ? [
          { from: '../pkg', to: './pkg', noErrorOnMissing: true }
        ] : [])
      ],
    }),
    // Use WasmPackPlugin if pkg doesn't exist or in development
    ...(!pkgExists || !isProduction ? [
      new WasmPackPlugin({
        crateDirectory: path.resolve(__dirname, '..'),
        outDir: path.resolve(__dirname, '../pkg'),
        extraArgs: isProduction ? '--release' : '--dev',
      })
    ] : [])
  ],
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
      },
      {
        directory: path.resolve(__dirname, '..'),
        publicPath: '/',
      }
    ],
    compress: true,
    port: 8080,
  },
}