var crypto = require('crypto');
export default (function (str) {
    var hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex');
});
//# sourceMappingURL=md5.js.map