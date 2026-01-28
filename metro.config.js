const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = path.resolve(__dirname);

const defaultConfig = getDefaultConfig(projectRoot);

// SVG fix
defaultConfig.resolver.assetExts =
  defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
defaultConfig.resolver.sourceExts =
  [...defaultConfig.resolver.sourceExts, 'svg'];

const customConfig = {
  projectRoot,
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
