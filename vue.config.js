process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  lintOnSave: false,
  publicPath: process.env.VUE_APP_PUBLIC_PATH
};
