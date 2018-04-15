export var censorMail = function (mail) {
    if (isMailValid(mail) === false) {
        return mail;
    }
    var _a = mail.split('@'), firstPart = _a[0], secondPart = _a[1];
    if (firstPart.length > 2) {
        return censorString(firstPart) + "@" + secondPart;
    }
    else if (secondPart.length > 2) {
        return firstPart + "@" + censorString(secondPart);
    }
    else {
        return mail;
    }
};
var censorString = function (string) {
    var censorLength = Math.ceil(string.length / 3);
    var partLength = (string.length - censorLength) / 2;
    var beforeCensorLength = Math.floor(partLength);
    return string.substr(0, beforeCensorLength) + '*'.repeat(censorLength) + string.substr(Math.ceil(beforeCensorLength + censorLength), string.length);
};
var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export var isMailValid = function (mail) { return re.test(String(mail).toLowerCase()); };
//# sourceMappingURL=mail-util.js.map