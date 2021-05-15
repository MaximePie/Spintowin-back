const jwt = require('jsonwebtoken');

module.exports = function(request, response, next) {
  const token = request.header('auth-token');
  if (!token) {
    return response.json({
      message: 'Access denied. Login to continue',
    })
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    request.user = verified;
    next();
  } catch (error) {
    response.json({
      message: "Invalid token",
    })
  }
}
