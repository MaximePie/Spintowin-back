const Lesson = require('../model/lesson');
const Chapter = require('../model/chapter');

/**
 * Creates a new Lesson based on the provided data in the request's body
 * @param request
 * @param response
 */
function create(request, response) {
  if (request.body) {
    let errors = [];
    const {label, url, icon, chapter_id, order} = request.body;

    if (!label) {
      errors.push('Erreur, il faut un label');
    }

    if (!chapter_id) {
      errors.push('Erreur, il faut un chapter_id')
    }

    if (!order && order !== 0) {
      errors.push('Erreur, il faut un order')
    }

    if (!errors.length) {
      Lesson.create({
        label,
        order,
        url: url || '',
        icon: icon || 'search',
      }, (error, data) => {

        // Update the chapter's list of Lessons
        Chapter.findById(chapter_id, (error, chapter) => {
          chapter.lessons.push(data._id);
          chapter.save();
        });

        response.status(200).json({message: 'La leçon a bien été créée !', data, error});
      });
    } else {
      response.status(400).json({message: errors});
    }

  } else {
    response.status(404).json({message: 'Aucun body trouvé'});
  }
}

function index(request, response) {
  response.status(200).json({
    message: 'Deleted!'
  });
}


module.exports.index = index;
module.exports.create = create;
