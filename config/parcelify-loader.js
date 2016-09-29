var path = require("path")
var fs = require("fs")
var loaderUtils = require("loader-utils")

var defaults = {
    json: "package.json",
    encoding: "utf8",
    require: "require($1)",
    lineBreakSeq: "\n"
}


function parcelify(source) {
    // flag as cacheable, as long as the dependencies do not change -> no need
    // to re-invoke this loader
    this.cacheable()

    // read config
    var config = loaderUtils.getLoaderConfig(this, "parcelifyLoader");
    config.json = config.json || defaults.json
    config.encoding = config.encoding || defaults.encoding
    config.require = config.require || defaults.require
    config.lineBreakSeq = config.lineBreakSeq || defaults.lineBreakSeq

    // check if there is a `package.json` and read its content
    var packageJson = path.resolve(this.context, config.json)
    var content
    try {
        content = fs.readFileSync(packageJson, config.encoding)
    } catch (readFileSyncError) {
        // cannot read `package.json`, return
        return source
    }

    // parse JSON
    var packageJsonContent
    try {
        packageJsonContent = JSON.parse(content)
    } catch (parseError) {
        console.log(packageJson+ " parsing failed: " + parseError)
        return source
    }
    
    // if there is a "style" property, ensure it is a file
    if (packageJsonContent.style === undefined) return source
    var styleFile = path.resolve(this.context, packageJsonContent.style)
    try {
        fs.accessSync(styleFile)
    } catch (accessSyncError) {
        console.log("Cannot find " + styleFile + ": " + accessSyncError)
        return source
    }

    // all good so far, add styleFile and to this loader's dependency
    this.dependency(styleFile)

    // Finally, add `import` statement to the original source
    // NOTE: this only adds the statement to the in-mem version of this source
    // file, the original file is NEVER altered
    var require = config.require
    require = require.replace("$1", JSON.stringify(styleFile))
    require += config.lineBreakSeq
    source = require + source

    return source
}

module.exports = parcelify