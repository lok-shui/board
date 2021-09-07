module.exports = {
    extends: ['react-app', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'warn',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-useless-concat': 'off',
        strict: 'off',
        'react-hooks/exhaustive-deps': 'off'
    }
};
