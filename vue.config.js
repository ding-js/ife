process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  lintOnSave: false,
  baseUrl: process.env.VUE_APP_PUBLIC_PATH
};
