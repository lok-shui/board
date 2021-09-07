const {override, overrideDevServer, addDecoratorsLegacy, addWebpackAlias, adjustWorkbox, useEslintRc, enableEslintTypescript, useBabelRc} = require('customize-cra');
const path = require('path');
const proxy = require('./config.proxy');

module.exports = {
    webpack: override(
        useEslintRc(),
        addWebpackAlias({
            '@': path.resolve(__dirname, 'src')
        }),
        useBabelRc(),
        addDecoratorsLegacy(),
        adjustWorkbox(wb => Object.assign(wb, {importWorkboxFrom: 'local'}))
    ),
    devServer: overrideDevServer(config => ({...config, proxy})),
    paths: paths => {
        paths.appBuild = path.resolve(__dirname, 'dist');
        return paths;
    }
};
