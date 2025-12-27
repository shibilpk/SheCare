const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// remove 'svg' from assetExts and add it to sourceExts
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
    ext => ext !== 'svg'
);
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'svg'];

const customConfig = {
    transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
};

module.exports = mergeConfig(defaultConfig, customConfig);
