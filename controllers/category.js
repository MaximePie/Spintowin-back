const Category = require("../model/category");


module.exports.categories = async function (request, response) {
  const categories = await Category.find({creatorId: request.params.userId});
  response.json(categories);
}

module.exports.createCategory = async function (request, response) {
  const { title } = request.body;
  if (title) {
    const newCategory = await Category.create({
      title,
      creatorId: request.params.userId
    })
    response.json({newCategory});
  }
  else {
    response.json({code: 500, message: "Title is required"});
  }
}
