// @tybys/ty version 1.0.0-alpha.2
// https://github.com/toyobayashi/ty

// _useVue: false
// _useVue3: false
// _electronTarget: false
// _webTarget: true
// _nodeTarget: false
// _extractCss: false
// _useSass: true
// _useStylus: false
// _useLess: false
// _useBabel: false
// _useVueJsx: false
// _useBabelToTransformTypescript: false
// _useTypeScript: true
// _useESLint: true
// _usePostCss: false
const path = require('path')
const webpack = require('webpack')
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const context = __dirname
const htmls = [path.join(context, 'public/index.html')]
const webConfig = {
  mode: 'development',
  context: context,
  target: 'web',
  entry: {
    app: [
      path.join(context, 'src/index')
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(context, 'dist'),
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      'const': false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false
    },
    publicPath: '/'
  },
  node: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: true,
              configFile: path.join(context, 'tsconfig.json')
            }
          }
        ]
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: true,
              configFile: path.join(context, 'tsconfig.json')
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve('style-loader')
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: {
                auto: true,
                localIdentName: '[path][name]__[local]'
              },
              importLoaders: 0
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: require.resolve('style-loader')
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: {
                auto: true,
                localIdentName: '[path][name]__[local]'
              },
              importLoaders: 1
            }
          },
          {
            loader: require.resolve('sass-loader'),
            options: {}
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'media/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          filename: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.join(context, 'src')
    },
    extensions: [
      '.tsx',
      '.ts',
      '.mjs',
      '.cjs',
      '.js',
      '.scss',
      '.sass',
      '.css',
      '.json',
      '.wasm'
    ],
    fallback: {
      dgram: false,
      fs: false,
      net: false,
      tls: false,
      child_process: false
    }
  },
  plugins: [
    new EslintWebpackPlugin({
      extensions: [
        'js',
        'jsx',
        'mjs',
        'tsx',
        'ts'
      ],
      emitWarning: true,
      emitError: false
    }),
    new HtmlWebpackPlugin({
      title: 'udig',
      template: path.join(context, 'public/index.html'),
      filename: 'index.html',
      minify: false,
      cache: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(context, 'public'),
          to: path.join(context, 'dist'),
          toType: 'dir',
          globOptions: {
            ignore: [
              '**/.gitkeep',
              '**/.DS_Store',
              path.join(context, 'public/index.html').replace(/\\/g, '/')
            ]
          },
          noErrorOnMissing: true
        }
      ]
    }),
    new webpack.DefinePlugin({}),
    new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(context, 'tsconfig.json'),
        extensions: {
          vue: false
        }
      }
    })
  ],
  devServer: {
    stats: {
      colors: true,
      children: false,
      modules: false,
      entrypoints: false
    },
    hot: true,
    host: '0.0.0.0',
    inline: true,
    open: false,
    contentBase: [
      path.join(context, 'dist')
    ],
    publicPath: '/',
    proxy: {},
    before: (_app, server) => {
      for (let i = 0; i < htmls.length; i++) {
        const item = htmls[i]
        const tpl = typeof item === 'string' ? item : item.template
        server._watch(tpl)
      }
    }
  },
  devtool: 'eval-source-map'
}
module.exports = webConfig
