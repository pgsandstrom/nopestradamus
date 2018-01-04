export default () => (req, res, next) => {
  res.setHeader('Cache-control', 'no-cache');
  next();
};
