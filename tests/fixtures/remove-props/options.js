module.exports = {
    plugins: [
        ['transform-remove-props', {
            regex: /^(prop1|prop2)$/,
            pureMembers: /^o\.pure(\.\d)?$/,
            pureCallees: /^o\.pure(\.\d)?$/
        }]
    ],
    comments: false,
    retainLines: true
};
