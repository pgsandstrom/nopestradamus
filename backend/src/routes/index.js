import prediction from './prediction';
export default (function (server) {
    prediction(server);
    server.get('/api/v1', function (req, res, next) {
        res.send('hello');
        next();
    });
});
//# sourceMappingURL=index.js.map