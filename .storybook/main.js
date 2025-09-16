module.exports = {
    stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(ts|tsx)"],
    features: {
        postcss: false,
    },
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
    // babel: async options => {
    //     return {
    //         ...options,
    //         plugins: [
    //             [require.resolve("@babel/plugin-proposal-class-properties"), { loose: true }],
    //             ...(options.plugins || []),
    //         ],
    //     };
    // },
    webpackFinal: async (config) => {
        setupUrlLoader(config);

        config.module.rules.unshift({
            test: /\.(sass|scss)(\?.*)?$/i,
            sideEffects: true,
            use: [
                { loader: require.resolve("style-loader") },
                { loader: require.resolve("css-loader") },
                { loader: require.resolve("sass-loader") },
            ],
        });

        // config.module.rules.unshift({
        //     test: /\.(less)(\?.*)?$/i,
        //     sideEffects: true,
        //     use: [
        //         { loader: require.resolve("style-loader") },
        //         { loader: require.resolve("css-loader") },
        //         {
        //             loader: require.resolve("less-loader"),
        //             options: {
        //                 lessOptions: {
        //                     javascriptEnabled: true,
        //                 },
        //             },
        //         },
        //     ],
        // });

        return config;
    },
};

/** Inline image src */
function setupUrlLoader(config) {
    config.module.rules = config.module.rules.filter((rule) => {
        return !(rule.loader && rule.loader.includes("file-loader"));
    });

    config.module.rules.unshift(
        {
            test: /\.(png|jpg|jpeg|gif|svg|ico|apng)(\?.*)?$/i,
            use: [
                {
                    loader: require.resolve("url-loader"),
                    options: {
                        limit: 14336,
                        name: "static/media/[name].[hash:8].[ext]",
                        esModule: false,
                    },
                },
            ],
        },
        {
            test: /\.(eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/i,
            loader: require.resolve("file-loader"),
            options: {
                name: "static/media/[name].[hash:8].[ext]",
                esModule: false,
            },
        }
    );
}
