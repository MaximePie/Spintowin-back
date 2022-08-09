import Category from "../model/category.js"

async function categories(request, response) {
  const categories = await Category.find({creatorId: request.params.userId});
  response.json(categories);
}

async function createCategory(request, response) {
  const {title} = request.body;
  if (title) {
    const newCategory = await Category.create({
      title,
      creatorId: request.params.userId
    });
    response.json({newCategory});
  } else {
    response.json({code: 500, message: "Title is required"});
  }
}


export default {
  categories,
  createCategory
}