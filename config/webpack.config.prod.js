process.env.NODE_ENV = "production"

var path = require("path")
var webpack = require("webpack")
var HtmlWebpackPlugin = require("html-webpack-plugin")

var src = path.resolve("src")


module.exports = {
    // Don"t attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    devtool: "source-map",
    entry: [
        require.resolve("./polyfills"),
        path.join(src, "index")
    ],
    output: {
        // The build folder.
        path: path.resolve("build"),
        // Generated JS file names (with nested folders).
        // There will be one main bundle, and one file per asynchronous chunk.
        filename: "static/js/[name].[chunkhash:8].js",
        chunkFilename: "static/js/[name].[chunkhash:8].chunk.js",
        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath: "/"
    },
    resolve: {
        extensions: [".js", ".json", ""],
        alias: {
            actions: path.join(src, "actions"),
            components: path.join(src, "components"),
            containers: path.join(src, "containers")
        }
    },
    module: {
        preLoaders: [
            // First, run the linter :)
            {
                test: /\.js$/,
                loader: "eslint",
                include: src
            },
            // parcelify!
            {
                test: /\.js$/,
                loader: path.join(__dirname, "./parcelify-loader"),
                include: src
            }
        ],
        loaders: [
            // Process JS with Babel
            {
                test: /\.js$/,
                loader: "babel",
                include: src,
                query: require("./babel.config.prod")
            },
            // "stylus"" loader enables awesome CSS syntax - see http://stylus-lang.com
            // "css" loader resolves paths in CSS and adds assets as dependencies
            // "style" loader turns CSS into JS modules that inject <style> tags.
            {
                test: /\.styl$/,
                loader: "style!css!stylus"
            },
            // "sass" loader enables sass for Carbon scss files
            {
                test: /\.scss$/,
                loader: "style!css!sass"
            },
            {
                test: /\.json$/,
                loader: "json"
            },
            // "file"" loader makes sure those assets get served by WebpackDevServer.
            // When you import() an asset, you get its (virtual) filename.
            // In production, they would get copied to the build folder.
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                exclude: /\/favicon.ico$/,
                loader: "file",
                query: {
                    name: "static/media/[name].[hash:8].[ext]"
                }
            },
            // A special case for favicon.ico to place it into build root directory.
            {
                test: /\/favicon.ico$/,
                include: path.resolve("public"),
                loader: "file",
                query: {
                    name: "favicon.ico?[hash:8]"
                }
            },
            // "html"" loader is used to process template page (index.html) to resolve
            // resources linked with <link href="./relative/path"> HTML tags.
            {
                test: /\.html$/,
                loader: "html",
                query: {
                    attrs: ["link:href"],
                }
            }
        ]
    },
    // Point ESLint to our predefined config.
    eslint: {
        configFile: path.join(__dirname, "eslint.js"),
        useEslintrc: false
    },
    // Configure sass-loader to work with parcelify-loader
    sassLoader: {
        includePaths: [
            path.resolve("./src/style"), // local overrides
            path.resolve("./node_modules/carbon/lib/style-config") // original carbon style
        ]
    },
    plugins: [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve("public/index.html"),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
        }),
        // This helps ensure the builds are consistent if source hasn"t changed:
        new webpack.optimize.OccurrenceOrderPlugin(),
        // Try to dedupe duplicated modules, if any:
        new webpack.optimize.DedupePlugin(),
        // Minify the code.
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            },
            mangle: {
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        })
    ],
    // Enable awesome CSS syntax with stylus and nib
    stylus: {
        use: [ require("nib")() ],
        import: ["~nib/lib/nib/index.styl"]
    }
}