/* eslint-disable no-param-reassign */
module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }

  config.module.rules.push({
    test: /\.glsl$/i,
    use: "raw-loader",
  });

  return config;
};
