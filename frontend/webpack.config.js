const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');

module.exports = {
  // devtool: 'source-map',
  entry: [
    'babel-polyfill', // babel-polyfill needs to be first, or IE11 might give problem in dev mode
    'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    'react-hot-loader/patch',
    './src',
  ],
  output: { path: path.join(__dirname, '/assets/'), publicPath: '/assets/', filename: 'bundle_dev.js' },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['airbnb'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: 'file-loader' },
      { test: /\.eot$/, use: 'file-loader' },
      { test: /\.svg$/, use: 'file-loader' },
      { test: /\.(jpg|png)$/, use: 'url-loader?limit=25000' },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // Remove unused locales from moment.js
    // See discussion at https://github.com/webpack/webpack/issues/198
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
  performance: {
    hints: false,
  },
  devServer: {
    proxy: {
      '/api/v1/**/*': {
        changeOrigin: true,
        secure: false,
        target: 'http://localhost:8088',
      },
    },
    historyApiFallback: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    hot: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

