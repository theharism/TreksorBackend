const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 6-digit
};

module.exports = {
  generateOtp,
};
