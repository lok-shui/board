module.exports = {
    plugins: {
        autoprefixer: {},
        'postcss-pxtorem': {
            rootValue: 16,
            unitPrecision: 4,
            propList: ['*'],
            selectorBlackList: ['html'],
            replace: true,
            mediaQuery: false,
            minPixelValue: 2
        }
    }
};
