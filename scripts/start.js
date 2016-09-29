/*!
 * Development start script
 *  
 * This will launch the development server on port 8080, listen to any code
 * changes and recompile, lint and reload your browser.
 * 
 * Credits for most of this to github.com/facebookincubator
 * 
 */
process.env.NODE_ENV = "development"

var chalk = require("chalk")
var detectPort = require("detect-port")
var opn = require("opn")
var path = require("path")
var webpack = require("webpack")
var WebpackDevServer = require("webpack-dev-server")

var config = require("../config/webpack.config.dev")

var DEFAULT_PORT = process.env.PORT || config.DEFAULT_PORT
var protocol = process.env.HTTPS === "true" ? "https" : "http"


var clearConsole = () => { process.stdout.write("\x1bc") }

// Prettify webpack"s output
var formatMessage = (message) => {
    return message
    // Make some common errors shorter:
    .replace(
        // Babel syntax error
        "Module build failed: SyntaxError:",
        "Syntax error:"
    )
    .replace(
        // Webpack file not found error
        /Module not found: Error: Cannot resolve "file" or "directory"/,
        "Module not found:"
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, "") // at ... ...:x:y
}

// set up the compiler
var setupCompiler = (port, protocol) => {
    var compiler =  webpack(config)

    // The `invalid` event fires when a file is changed and webpack is
    // recompiling the bundle; in contrast to its name, this does not imply
    // any errors
    compiler.plugin("invalid", function() {
        clearConsole()
        console.log("Compiling...")
    })

    // The `done` event fires when webpack is done compiling; regardless of
    // warnings or errors (so even a broken compile is eventually "done")
    compiler.plugin("done", function(stats) {
        clearConsole()
        var hasErrors = stats.hasErrors()
        var hasWarnings = stats.hasWarnings()

        // all good
        if (!hasErrors && !hasWarnings) {
            console.log(chalk.green("Compiled successfully!"))
            console.log()
            console.log("The app is running at:")
            console.log()
            console.log("  " + chalk.cyan(protocol + "://localhost:" + port + "/"))
            console.log()
            return
        }

        // format the warnings/errors
        var json = stats.toJson({}, true)
        var formattedErrors = json.errors.map(message => "Error in " + formatMessage(message))
        var formattedWarnings = json.warnings.map(message => "Warning in " + formatMessage(message))

        if (hasErrors) {
            console.log(chalk.red("Failed to compile."))
            console.log()
            formattedErrors.forEach(message => {
                console.log(message)
                console.log()
            })
            return
        }

        if (hasWarnings) {
            console.log(chalk.yellow("Compiled with warnings."))
            console.log()
            formattedWarnings.forEach(message => {
                console.log(message)
                console.log()
            })
        }
    })

    return compiler
}

// run dev server
var runDevServer = (port, protocol) => {
    var devServer = new WebpackDevServer(setupCompiler(port, protocol), {
        // Do not server any files
        contentBase: [],
        // Enable hot reloading (launches a web socket)
        hot: true,
        // In development, always server from the root /
        publicPath: config.output.publicPath,
        // Silence chatty webpack :)
        quiet: true,
        // Avoids CPU overload on some systems
        watchOptions: {
            ignored: /node_modules/
        },
        // Enable https if env.HTTPS is set to true
        https: protocol === "https" ? true : false,
        // This serves index.html on all requests and enables HTML5/SPA
        // routing (like `react-router`)
        historyApiFallback: true
    })
    
    devServer.listen(port, (err, result) => {
        if (err) return console.log(err)
        
        clearConsole()
        console.log(chalk.cyan("Starting development server..."))
        console.log()

        // open the browser (will always open a new tab/window)
        opn(protocol + "://localhost:" + port + "/")
    })
}

// fire it up and make sure port DEFAULT_PORT is free 
detectPort(DEFAULT_PORT).then(port => {
    if (port === DEFAULT_PORT) {
        runDevServer(port, protocol)
        return
    }

    clearConsole()
    console.log(chalk.yellow("Cannot launch, port " + DEFAULT_PORT + " is busy."))
    console.log()
})
