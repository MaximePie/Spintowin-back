const express = require('express');
const router = express.Router();
const lessonsController = require('./controllers/lesson');
const chapterController = require('./controllers/chapter');
const cardsController = require('./controllers/card');
const multer  = require('multer');
const upload = multer({ dest: './uploads/' });

// Let's put all the routes here.
// If the amount of routes is too big, create a folder and split the file, one file for each entity should do the work

// Lessons
router.get('/lessons/', lessonsController.index);
router.post('/lessons/', lessonsController.create);

// Chapters
router.get('/chapters/', chapterController.index);
router.post('/chapters/', chapterController.create);


// Cards

router.get('/cards/', cardsController.index);
router.get('/cards/stats', cardsController.stats);
router.post('/cards/', upload.single('questionImage'), cardsController.create);
router.post('/cards/:id', cardsController.update);
// app.delete('/your_route/:id', cardsController.delete);
router.get('/cards/seeds', cardsController.generate);
router.get('/cards/deleteAll', cardsController.deleteAll);


module.exports = router;
