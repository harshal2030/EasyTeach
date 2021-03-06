module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-react'],
  plugins: [
    ['polyfill-corejs3', {method: 'usage-global'}],
    '@babel/plugin-transform-regenerator',
    ['polyfill-regenerator', {method: 'usage-global'}],
  ],
};
