module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.extensions.push(".ts", ".tsx");
      return webpackConfig;
    },
  },
};
