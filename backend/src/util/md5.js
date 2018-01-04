const crypto = require('crypto');

export default (str) => {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};
