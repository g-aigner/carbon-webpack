var path = require("path")

module.exports = {
    babelrc: false,
    presets: [
        require.resolve("babel-preset-latest"),
        require.resolve("babel-preset-react")
    ],
    plugins: [
        require.resolve("babel-plugin-transform-class-properties"),
        require.resolve("babel-plugin-transform-object-rest-spread"),
        [
            require.resolve("babel-plugin-transform-regenerator"),
            {
                async: false
            }
        ],
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