var path = require("path")

module.exports = {
    // Ignore .babelrc since we are using this file
    babelrc: false,
    presets: [
        require.resolve("babel-preset-latest"),
        require.resolve("babel-preset-react")
    ],
    plugins: [
        // class { handleClick = () => { } }
        require.resolve("babel-plugin-transform-class-properties"),
        // { ...todo, completed: true }
        require.resolve("babel-plugin-transform-object-rest-spread"),
        // function* () { yield 42; yield 43; }
        [
            require.resolve("babel-plugin-transform-regenerator"),
            {
                // Async functions are converted to generators by babel-preset-latest
                async: false
            }
        ],
        // Polyfills the runtime needed for async/await and generators
        [
            require.resolve("babel-plugin-transform-runtime"),
            {
                helpers: false,
                polyfill: false,
                regenerator: true
            }
        ]
  ]
}