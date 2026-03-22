process.env.GENERATE_SOURCEMAP = "false";

const coinbaseWalletPattern = /@coinbase[\\/]wallet-sdk/;

const appendExclude = (currentExclude) => {
  if (!currentExclude) {
    return [coinbaseWalletPattern];
  }

  if (Array.isArray(currentExclude)) {
    return [...currentExclude, coinbaseWalletPattern];
  }

  return [currentExclude, coinbaseWalletPattern];
};

module.exports = {
  style: {
    postcss: {
      mode: 'file',
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (rule.enforce !== "pre") {
          return rule;
        }

        const uses = Array.isArray(rule.use) ? rule.use : [];
        const hasSourceMapLoader = uses.some((use) => {
          if (typeof use === "string") {
            return use.includes("source-map-loader");
          }

          return use?.loader?.includes("source-map-loader");
        });

        if (!hasSourceMapLoader) {
          return rule;
        }

        return {
          ...rule,
          exclude: appendExclude(rule.exclude),
        };
      });

      return webpackConfig;
    },
  },
};
