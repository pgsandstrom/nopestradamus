export var getCookie = function (request, name) {
    if (request.headers.cookie) {
        var cookieArray = void 0;
        if (typeof request.headers.cookie === "string") {
            var cookieString = request.headers.cookie;
            cookieArray = cookieString.split(';');
        }
        else {
            cookieArray = request.headers.cookie;
        }
        var cookie = cookieArray.find(function (header) { return header.trim().startsWith(name + "="); });
        if (cookie != null) {
            return cookie.substring(cookie.indexOf('=') + 1);
        }
    }
    return null;
};
//# sourceMappingURL=cookie.js.map