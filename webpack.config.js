const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'src/dist')
  },
  plugins: [
    new WebpackShellPluginNext({
      onAfterDone: {
        scripts: ['./release.sh'],
        blocking: true,
        parallel: false
      }
    })
  ]
};
