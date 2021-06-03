const Badge = require('../model/badge');


async function create(request, response) {
  const user = request.user;
  let badge = {};

  if (request.body) {
    const {
      color,
      imageUrl,
      title,
      requirementsDescription,
      requiredField,
      requiredAmount,
      level,
    } = request.body;

    badge = await Badge.create({
      color,
      imageUrl,
      title,
      requirementsDescription,
      requiredField,
      requiredAmount,
      level,
    })
  }

  response.status(200).json({
    user,
    badge,
  })
}

module.exports.create = create;
