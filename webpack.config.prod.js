const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const JSONMinimizer = require('json-minimizer-webpack-plugin');

const ImageMin = require('image-minimizer-webpack-plugin');
const {extendDefaultPlugins} = require('svgo');

const CompressionPlugin = require('compression-webpack-plugin');

const ReactWebConfig =
  require('react-web-config/lib/ReactWebConfig').ReactWebConfig;

const envFilePath = path.resolve(__dirname, './.env.production');
const appDirectory = path.resolve(__dirname);
const {presets} = require(`${appDirectory}/babel.config.js`);

const compileNodeModules = [
  // Add every react-native package that needs compiling
  // 'react-native-gesture-handler',
  'react-native-animatable',
  'react-native-vector-icons',
  'react-native-elements',
  'react-native-ratings',
  'react-native-lightbox-v2',
  'react-native-dialog',
  'react-native-svg',
  'react-native-svg-transformer',
  '@react-native-picker/picker',
  'react-native-web',
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.js$|tsx?$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(__dirname, 'index.web.js'), // Entry to your application // Change this to your main App file
    path.resolve(__dirname, 'web'),
    path.resolve(__dirname, 'shared'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: ['react-native-web'],
    },
  },
};

const svgLoaderConfiguration = {
  test: /\.svg$/,
  exclude: /node_modules/,
  use: [
    {
      loader: '@svgr/webpack',
    },
  ],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

const cssLoader = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
};

module.exports = {
  entry: {
    app: path.join(__dirname, 'index.web.js'),
  },
  output: {
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
    filename: `[contenthash]-${Date.now()}.js`,
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: {
      'react-native-config': 'react-web-config',
      'react-native$': 'react-native-web',
      'lottie-react-native': 'react-native-web-lottie',
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      svgLoaderConfiguration,
      cssLoader,
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        test: /\.(js|ts|tsx|jsx)$/i,
      }),
      new JSONMinimizer(),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      favicon: path.join(__dirname, './favicon.ico'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(true),
    }),
    ReactWebConfig(envFilePath),
    new BundleAnalyzerPlugin(),
    new CompressionPlugin(),
    new ImageMin({
      minimizerOptions: {
        plugins: [
          ['gifsicle', {interlaced: true}],
          ['jpegtran', {progressive: true}],
          ['optipng', {optimizationLevel: 5}],
          // Svgo configuration here https://github.com/svg/svgo#configuration
          [
            'svgo',
            {
              plugins: extendDefaultPlugins([
                {
                  name: 'removeViewBox',
                  active: false,
                },
                {
                  name: 'addAttributesToSVGElement',
                  params: {
                    attributes: [{xmlns: 'http://www.w3.org/2000/svg'}],
                  },
                },
              ]),
            },
          ],
        ],
      },
    }),
  ],
};
