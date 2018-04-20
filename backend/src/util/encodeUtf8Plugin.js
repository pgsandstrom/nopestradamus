export default (function () { return function (req, res, next) {
    res.charSet('utf8');
    next();
}; });
//# sourceMappingURL=encodeUtf8Plugin.js.map