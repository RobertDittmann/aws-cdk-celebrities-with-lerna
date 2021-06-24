const path = require('path');

module.exports = {
    mode: 'development',

    devtool: 'eval-source-map', // quicker for development purposes

    entry: './src/endpoint.ts', // entry point for webpack
    module: {
        rules: [
            {
                test: /\.ts$/, // file ends with .ts
                use: 'ts-loader',
                include: [ // specify where typescript files should be
                    path.resolve(__dirname, 'src'),
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        publicPath: 'dist',
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    }
};
