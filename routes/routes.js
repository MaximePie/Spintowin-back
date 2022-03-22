const express = require('express');
const router = express.Router();
const lessonsController = require('../controllers/lesson');
const chapterController = require('../controllers/chapter');
const cardsController = require('../controllers/card');
const userCardsController = require('../controllers/userCard');
const userController = require('../controllers/user');
const badgeController = require('../controllers/badge');
const seeder = require('../database/seeder');

const multer  = require('multer');
const upload = multer({ dest: './uploads/' });
const verify = require('../routes/verifyToken');
const verifyDevelopper = require('../routes/verifyDevelopper');

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
router.get('/users/', userController.index);

// Verified routes
router.get('/users/connectedUser/', verify, userController.connectedUser);
router.get('/users/connectedUser/scales', verify, userController.scales);
router.get('/users/connectedUser/progress', verify, userController.progress);
router.get('/users/connectedUser/badges', verify, userController.badges);
router.get('/users/logout/', verify, userController.login);


// Cards
router.get('/cards/getOne', verify, cardsController.getOne);
router.get('/cards/stats', verify, cardsController.stats);
router.post('/cards/', verify, upload.single('file'), cardsController.create);
router.post('/cards/edit/:id', verify, cardsController.edit);
router.get('/cards/delete/:id', cardsController.delete);
router.get('/cards/deleteAll', verify, cardsController.deleteAll);

// UserCards
router.get('/userCards/getOne', verify, userCardsController.reviewOne);
router.get('/userCards', verify, userCardsController.train);
router.get('/userCards/absorb/:id', verify, userCardsController.absorb);
router.get('/userCards/resorb/:userCardId', verify, userCardsController.resorb);
router.get('/userCards/list/:_id', verify, userCardsController.list);
router.get('/userCards/transfert/:_id', verifyDevelopper, userCardsController.transfert);
router.post('/userCards/absorbMany', verify, userCardsController.absorbMany);
router.post('/userCards/update/:id', verify, userCardsController.update);


// Admin cards
router.post('/seed', verifyDevelopper, seeder.seed);
router.post('/badge', verifyDevelopper, badgeController.create);


module.exports = router;
