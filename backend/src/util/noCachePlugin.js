export default (function () { return function (req, res, next) {
    res.setHeader('Cache-control', 'no-cache');
    next();
}; });
//# sourceMappingURL=noCachePlugin.js.map