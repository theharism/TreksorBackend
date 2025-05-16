const logger = require('../services/logger');

module.exports = async function loggingMiddleware(req, res, next) {
	logger.info(logger.logTypes.ROUTE, {message:JSON.stringify({ url: req.url, method: req.method,body: req.body,file:req.file }, null, 2)});
	next();
};