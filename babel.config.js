module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-react'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
