const express = require('express');
const router = express.Router();
const lessonsController = require('../controllers/lesson');
const chapterController = require('../controllers/chapter');
const cardsController = require('../controllers/card');
const userController = require('../controllers/user');
const seeder = require('../database/seeder');

const multer  = require('multer');
const upload = multer({ dest: './uploads/' });
const verify = require('../routes/verifyToken');

// Let's put all the routes here.
// If the amount of routes is too big, create a folder and split the file, one file for each entity should do the work

// Lessons
router.get('/lessons/', lessonsController.index);
router.post('/lessons/', lessonsController.create);

// Chapters
router.get('/chapters/', chapterController.index);
router.post('/chapters/', chapterController.create);

// Users
router.post('/users/register/', userController.create);
router.post('/users/login/', userController.login);
router.get('/users/connectedUser/', verify, userController.connectedUser);
router.get('/users/connectedUser/scales', verify, userController.scales);
router.get('/users/connectedUser/progress', verify, userController.progress);
router.get('/users/logout/', verify, userController.login);


// Verified routes
// Cards
router.get('/cards/test', verify, cardsController.test);
router.get('/cards', verify, cardsController.index);
router.get('/cards/getOne', verify, cardsController.getOne);
router.get('/cards/stats', verify, cardsController.stats);
router.post('/cards/', verify, upload.single('file'), cardsController.create);
router.post('/cards/:id', verify, cardsController.update);
// app.delete('/your_route/:id', cardsController.delete);
router.get('/cards/deleteAll', verify, cardsController.deleteAll);
router.get('/cards/attachToConnectedUser', verify, cardsController.attach);

router.get('/seed', seeder.seed);


module.exports = router;
