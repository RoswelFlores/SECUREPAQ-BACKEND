const crypto = require('crypto');

const generarOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = {
  generarOTP
};
