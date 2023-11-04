const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    clean: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'static', to: 'static' },
        { from: 'src', to: 'src' },
        {
          from:
            process.env.MANIFEST === 'v2'
              ? 'manifest.v2.json'
              : 'manifest.v3.json',
          to: 'manifest.json',
        },
      ],
    }),
  ],
};

module.exports = () => config;
