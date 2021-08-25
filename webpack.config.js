/**
 * 1、webpack.config.js webpack配置文件
 * 作用：指示webpack干哪些活（当运行webpack指令时，会加载里面的配置） 
 * 所有构建工具都是基于node.js平台运行的～模块话默认用commonjs
 * loader: 1、下载  2、使用（配置loader）
 * plugins: 1、下载 2、引入 3、使用    
 */

/**
 * 2、HMR功能：hot module replacement
 * 作用：一个模块发生变化，只会更新打包这一个模块（而不是打包所有模块）
 *      提升打包速度
 *      样式文件：可以使用HMR功能：因为style-loader内部实现了
 *      js文件：默认不能使用HMR功能，需要修改代码添加支持HMR的代码
 *          注：HRM处理js文件时，不会处理入口文件的js代码
 *      html文件：默认不能使用HMR功能，并且会导致html无法热更新
 *          解决：修改entry入口，将html文件引入
 */

/**
 * 3、tree shaking: 去除无用代码
 *      注：必须使用es6模块化，并且开启production环境
 * 作用：减少代码体积，提升打包速度
 *  "sideEffects": false (所有代码都没有副作用，都可以tree shaking)
 * "sideEffects": ["*.css"]
 */

/**
 * 4、PWA:渐进式网络开发程序(离线可访问)
 * workbox --> workbox-webpack-plugin
 */
// 用来拼接绝对路径的方法
const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin') 
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

// 设置nodejs环境变量
process.env.NODE_ENV = 'production';

module.exports = {
    // webpack配置
    // 入口起点
    entry : ['./src/js/index.js','./src/index.html'],
    // entry:{
    //     // 多入口，有一个入口 
    //     main: './src/js/index.js',
    //     test: './src/js/print.js'
    // },
    // 输出
    output: {
        // 输出文件夹
        filename : 'js/[name].[contenthash:10].js',
        // 输出路径
        // __dirname nodejs变量，当前文件目录的绝对路径
        path : resolve(__dirname, 'build')
    },
    // loader的配置
    // 不同文件配置不同的loader
    module:{
        rules:[
            /**
                * 语法检查：eslint-loader eslint
                * 只检查自己的源代码，第三方库的使用不检查
                * 设置检查规则：
                *      package.json中eslintConfig中设置～ 
                *      airbnb --> eslint and eslint-plugin-import.
                * "exlintConfig": {
                    "extends": "airbnb-base"
                    }
            */ 

            // 一般一个文件指定一个loader进行处理 所以要先执行eslint再执行babel  
            {
                test: /\.js$/,
                exclude: /node_modules/,
                enforce: 'pre',
                loader: 'eslint-loader',
                options:{
                    // 自动修复
                    fix: true
                }
            },
            {
                /**
                 * js兼容性处理：babel-loader @babel/preset-env @babel/core
                 * 1、基于js的兼容性处理 --> @babel/preset-env
                 * 问题：只能转化基本语法，promise无法转化
                 * 2、全部js兼容性处理 --> @babel/polyfill
                 * 问题：会将所有兼容性问题都加载过来一起解决，体积太大
                 * 3、按需加载处理兼容性问题：core-js
                */ 
                // 以下loader只会匹配一个
                // 优化打包构建速度
                oneOf: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                        options: {
                            // 预设babel做怎样的兼容性处理
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        //按需加载处理
                                        useBuiltIns: 'usage',
                                        // 指定core-js版本
                                        corejs: {
                                            version: 3
                                        },
                                        // 指定兼容性做到哪个版本浏览器
                                        targets: {
                                            chrome: '60',
                                            firefox: '60',
                                        }
                                    }
                                ]   
                            ],
                            // 开启babel缓存
                            // 第二次构建时会读取之前的缓存
                            /**
                             * 缓存：
                             *  1、babel缓存
                             *  2、文件资源缓存（修改文件名） 
                             *      问题：js和css使用同一个hash值
                             *      如果重新打包会使所有缓存失效
                             *  chunkhash: 根据chunk来生成hash,如果源于同一个chunk那么hash值就一样
                             *      问题：css和js在同一个入口文件被引入所以还是一样的
                             *  contenthash: 根据文件内容生成不同hash,
                             */
                            cacheDirectory: true
                            
                        }
                    },
                    // 详细的loader配置
                    {
                        // 匹配哪些文件
                        test: /\.css$/,
                        // 使用哪些loader来处理
                        // use数组中的执行顺序从右到左，从下到上依次执行
                        use: [
                            // 创建style标签，将js中的样式资源插入，添加到head中生效
                            // 'style-loader',
                            MiniCssExtractPlugin.loader,
                            // 将css文件变成commonjs模块加载在js中，内容是样式字符串
                            'css-loader',
                            /* 
                                css兼容性处理：postcss -> postcss-loader postcss-preset-env 
                                帮助postcss找到package.json中browserslist里面的配置，通过配置加载指定css兼容样式
                                "browserslist":{
                                // 开发环境 --> 设置node环境变量: process.env.NODE_ENV = development
                                "development": [
                                "last 1 chorm version", // 最近一个版本的chrome浏览器版本
                                "last 1 firefox version",
                                "last 1 safari version"
                                ],
                                // 生产环境：默认看生产环境
                                "production": [
                                ">0.2%",
                                "not dead",
                                "not op_mini all"
                                ]
                            }
                            */
                            // 使用loader的默认配置
                            // ‘postcss-loader
                            // 修改loader配置
                            {
                                loader: 'postcss-loader',
                            }
                        ]
                    },
                    {
                        test: /\.less$/,
                        use:[
                            // 'style-loader',
                            MiniCssExtractPlugin.loader,
                            'css-loader',
                            'less-loader'
                        ]
                    },
                    {
                        // 处理不了html中的img图片
                        // 处理图片资源
                        test: /\.(jpg|png|gif)$/,
                        loader: 'url-loader',
                        options: {
                            // 当图片大小小于8kb,就会被当作base64来处理
                            // 优点：减少请求数量（减少服务器压力）
                            // 缺点：图片体积会变大，请求速度会变慢
                            limit: 8 * 1024,
                            name: '[hash:10].[ext]',
                            // 问题：url-loader默认使用ES6模块化解析，而html-loader引入的图片是commonjs解析的
                            // 解析时会出问题：[object, Module]
                            // 解决url-loader的es6模块解析,使用commonjs解析
                            esModule: false,
                            outputPath: 'imgs'
                        },
                    },
                    {
                        test: /\.html$/,
                        // 处理HTML文件的img图片(负责引入图片，从而被url-loader处理)
                        loader: 'html-loader',
                    },
                    {
                        exclude: /\.(html|css|less|gif|jpg|png|js)/,
                        loader : 'file-loader',
                        options: {
                            name: '[hash:10].[ext]',
                            outputPath: 'media'
                        }
                    }
                ]
            }
        ]
    },
    // plugins的配置 
    plugins: [
        // html-webpack-plugins
        // 默认创建一个空的html， 自动引入打包输出的所有资源（JS/CSS）
        new HtmlWebpackPlugin({
            // 复制 ./src/index.html 文件，并自动引入打包输出的所有资源（JS/CSS）
            template: './src/index.html',
            minify: {
                // 移除空格
                collapseWhitespace: true,
                // 移除注释
                removeComments: true 
            }
        }),
        new MiniCssExtractPlugin({
            // 对输出文件进行重命名
            filename: 'css/built.[contenthash:10].css'
        }),
        // 压缩css
        new OptimizeCssAssetsWebpackPlugin(),
        // PWA
        /**
         * 1、帮助serviceworker快速启动
         * 2、删除旧的serviceworker
         * 
         * 生成一个serviceworker 配置文件～
         */
        new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        })
    ],
    /**
     * 可以将node_module单独打包成一个chunk
     * 自动分析多入口打包文件中有没有共用的文件，共用文件只会打包一次
     */
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    //模式
    mode: 'production', // 开发模式
    // mode: 'production' 
    // 开发服务器：devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器）
    // 只会在内存中编译打包，不会有任何输出
    // 启动devServer指令为：webpack-dev-server
    devServer: {
        contentBase: resolve(__dirname, 'build'),
        // 启用gzip压缩，是代码体积小，运行速度更快
        compress: true,
        // 端口号
        port: 3001,
        open: true,
        //HMR功能开启
        hot: true
    },
    devtool:'source-map',
    target: 'web'
}

/**
 * source-map:提供一种源代码到构建后的代码映射的技术（如果构建后代码出错，可以追踪到源代码的错误）
 * [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
 * 
 * 可以提示错误代码准确信息，和源代码错误位置
 * source-map
 * 
 * 1、只生成一个source-map文件
 * 2、可以提示错误代码准确信息，和源代码错误位置
 * inline-source-map: 内联
 * 
 * 提示错误代码错误原因但没错误位置
 * hidden-source-map：外部
 * 
 * 1、每一个文件都生成一个source-map文件 
 * eval-source-map：内联
 * 
 * nosources-source-map:外部
 * 
 * cheap-source-map:外部
 * 
 * 
 * 内联 和外部的区别 1、没有生成外部文件 2、内联比外部更快
 * 
 * 开发环境：速度快（eval > inline > cheap），调试友好
 * 速度：eval-cheap-source-map > eval-source-map
 * 
 * 调试：cheap-module-source-map
 * module会将loader的source-map加入
 * 一般会使用:eval-source-map
 * 
 * 生产环境：源代码是否隐藏，调试友好
 * 
 * 生产环境一般使用：source-map / cheap-module-source-map
 */