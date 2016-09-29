
var path = require("path")
var webpack = require("webpack")
var HtmlWebpackPlugin = require("html-webpack-plugin")
var CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin")
var WatchMissingNodeModulesPlugin = require("./WatchMissingNodeModulesPlugin")

var src = path.resolve("src")


module.exports = {
    // This makes the bundle appear split into separate modules in the devtools.
    devtool: "eval",
    // entry points into our application
    entry: [
        // Include WebpackDevServer client. It connects to WebpackDevServer via
        // sockets and waits for recompile notifications. When WebpackDevServer
        // recompiles, it sends a message to the client by socket. If only CSS
        // was changed, the app reload just the CSS. Otherwise, it will refresh.
        // The "?/" bit at the end tells the client to look for the socket at
        // the root path, i.e. /sockjs-node/. Otherwise visiting a client-side
        // route like /todos/42 would make it wrongly request /todos/42/sockjs-node.
        // The socket server is a part of WebpackDevServer which we are using.
        // The /sockjs-node/ path I"m referring to is hardcoded in WebpackDevServer.
        require.resolve("webpack-dev-server/client") + "?/",
        // Include Webpack hot module replacement runtime. Webpack is pretty
        // low-level so we need to put all the pieces together. The runtime listens
        // to the events received by the client above, and applies updates (such as
        // new CSS) to the running application.
        require.resolve("webpack/hot/dev-server"),
        // a few polyfills
        require.resolve("./polyfills"),
        // Finally, this is our application"s code
        // We include the app code last so that if there is a runtime error during
        // initialization, it doesn"t blow up the WebpackDevServer client, and
        // changing JS code would still trigger a refresh.
        path.join(src, "index")
    ],
    output: {
        // Next line is not used in dev but WebpackDevServer crashes without it:
        path: path.resolve("build"),
        // Add /* filename */ comments to generate require()s in the output
        pathInfo: true,
        // This does not produce a real file. It"s just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: "static/js/bundle.js",
        // In development, we always serve from the root. This makes config easier.
        publicPath: "/"
    },
    resolve: {
        extensions: [".js", ".json", ""],
        alias: {
            containers: path.join(src, "containers"),
            components: path.join(src, "components"),
            actions: path.join(src, "actions")
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
                include: [
                    src,
                    path.resolve("./node_modules/carbon")
                ]
            }
        ],
        loaders: [
            // Process JS with Babel
            {
                test: /\.js$/,
                loader: "babel",
                include: src,
                query: require("./babel.config.dev")
            },
            // "stylus" loader enables awesome CSS syntax - see http://stylus-lang.com
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
    // Configure parcelify-loader
    parcelifyLoader: {
        json: "package.json"
    },
    plugins: [
        // Generates an index.html file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve("public/index.html")
        }),
        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),
        // Watcher doesn"t work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        new CaseSensitivePathsPlugin(),
        // If you require a missing module and then "npm install"" it, you still have
        // to restart the development server for Webpack to discover it. This plugin
        // makes the discovery automatic so you don"t have to restart.
        new WatchMissingNodeModulesPlugin(path.resolve("node_modules"))
    ],
    // Enable awesome CSS syntax with stylus and nib
    stylus: {
        use: [ require("nib")() ],
        import: ["~nib/lib/nib/index.styl"]
    },
    // default port for dev server
    DEFAULT_PORT: 8080
}