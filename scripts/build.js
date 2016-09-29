/*!
 * Production build script 
 * 
 * This will create a production build and place all necessary files in the
 * `build` directory. You can deploy this to the live server.
 * 
 * Credits for most of this to github.com/facebookincubator
 * 
 */
var chalk = require("chalk")
var path = require("path")
var rimrafSync = require("rimraf").sync
var webpack = require("webpack")

var config = require("../config/webpack.config.prod")

var build = path.resolve("build")


// Remove all content but keep the directory so that
// if you"re in it, you don"t end up in Trash
rimrafSync(build + "/*")

console.log("Creating an optimized production build...")

webpack(config).run((err, stats) => {
    if (err) {
        console.error("Failed to create a production build. Reason:")
        console.error(err.message || err)
        process.exit(1)
    }

    console.log()
    console.log(chalk.green("Compiled successfully."))
    console.log()
    console.log("The " + chalk.cyan("build") + " folder is ready to be deployed.")
    console.log()
})