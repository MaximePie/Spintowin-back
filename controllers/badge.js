import Badge from '../model/badge.js'
import {badges} from '../data/badges.js'


async function create(request, response) {
  await badges.forEach((badge) => {
    Badge.create(badge);
  });
  response.json({
    badge: await Badge.find({}),
  })
}

export default {
  create
}