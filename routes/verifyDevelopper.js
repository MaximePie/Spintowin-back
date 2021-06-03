module.exports = function (request, response, next) {
  if (!process.env.CURRENT_ENVIRONMENT === 'local') {
    return response.status(401).json({
      message: "L'opération est réservé aux développeureuses",
    })
  }
  else {
    next();
  }
}
