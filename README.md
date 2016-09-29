# carbon-webpack

A simple `HelloWorld` project to show how 
[Sage/carbon](https://github.com/Sage/carbon) can work with 
[webpack](https://github.com/webpack/webpack).

## tl;dr

```
$ git clone https://github.com/g-aigner/carbon-webpack

$ cd carbon-webpack
$ npm i

$ npm start
```
**Note**:  this build will fail for pre-v.0.26.0 carbon dependencies due to 
[pull #752](https://github.com/Sage/carbon/pull/752) (font url support for 
webpack). To fix this, add a wrapping `url()` statement to all external 
`@import`s in the relevant SaSS sources. 

## Why is this necessary?

Carbon supports webpack out of the box; however, it relies on 
[Parcelify](https://github.com/rotundasoftware/parcelify) to bundle necessary 
module stylesheets. Carbon comes with a style per component (specified in the 
component's `package.json`) and a global `style-config` overwrite directory. 
Webpack relies on CommonJS import/require syntax, so it does not read bundling 
information from a package file.

## How does this work?

There are two bits required to make this work:

* `parcelify-loader`

   A simple webpack loader that is applied as a preloader to every javascript 
   source file in the build tree and adds a dependency for the style specified 
   in `package.json`.

* `sass-loader`

   A SaSS loader for webpack that transforms the `*.scss` files.  
   (This loader would be necessary for any SaSS source regardless of carbon) 

## Configuration

You will need to configure `sass-loader` and `parcelify-loader` for the 
appropriate source files in your `webpack.config.js`.

### sass-loader

Apply `sass-loader` to the desired filetypes:

```javascript
module: {
    loaders: [
        {
            test: /\.scss$/,
            loader: "style!css!sass"
        },
    ]
}
```
**Note**: `sass-loader` needs [css-loader](https://github.com/webpack/css-loader)
and [style-loader](https://github.com/webpack/style-loader) to correctly chain 
the output style (this is not carbon specific).

Configure `sass-loader` for carbon-specific overwrite dependencies:

```javascript
// after module {} section in your webpack.config.js
sassLoader: {
    includePaths: [
        path.resolve("./src/style-config"), // local overrides
        path.resolve("./node_modules/carbon/lib/style-config") // original carbon style
    ]
}
```

### parcelify-loader

Apply `parcelify-loader` to the desired filetypes (as preloader, so it runs 
before all other transformations):

```javascript
module: {
    preLoaders: [
        {
            test: /\.js$/,
            loader: path.join(__dirname, "./parcelify-loader"),
            include: [
                path.resolve("./src"),
                path.resolve("./node_modules/carbon")
            ]
        }
    ]
}       
```
**Note**: this assumes that the `parcelify-loader` is in the same directory as
your `webpack.config.js`, it is not available through `npm` so you need to 
include its source file with your project.

Make sure you include the carbon source directory in `include`; otherwise, 
native styles for carbon components will not be included.

(*Optional*) Configure `parcelify-loader` with project specific settings:

```javascript
// after module {} section in your webpack.config.js
parcelifyLoader: {
    json: "component.json"
}
```

## parcelify-loader API

The following settings can be configured for `parcelify-loader`:

* `json` - the filename of your component's json file. Default:
```javascript
parcelifyLoader: {
    json: "package.json"
}
``` 
* `encoding` - the encoding of your component's json file. See 
[list of encodings](https://github.com/nodejs/node/blob/master/lib/buffer.js) 
for supported encodings. Default:
```javascript
parcelifyLoader: {
    encoding: "utf8"
}
``` 
* `require` - the statement to wrap the required style file in. Note that 
this setting **must** have a `$1` parameter to work. Default:
```javascript
parcelifyLoader: {
    require: "require($1)"
}
```
* `lineBreakSeq` - the character sequence to render after `require`. Typically,
you will not need anything but the linebreak. Default:
```javascript
parcelifyLoader: {
    lineBreakSeq: "\n"
}
```
