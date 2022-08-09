import multer from 'multer'
import express from 'express'

import cardsController from '../controllers/card.js'
import userCardsController from '../controllers/userCard.js'
import userController from '../controllers/user.js'
import badgeController from '../controllers/badge.js'
import categoriesController from '../controllers/category.js'
import seeder from '../database/seeder.js'
import verify from '../routes/verifyToken.js'
import verifyDevelopper from '../routes/verifyDevelopper.js'
import UserAnswer from "../model/stats/userAnswer.js";

const router = express.Router();
const upload = multer({dest: './uploads/'});

// Let's put all the routes here.
// If the amount of routes is too big, create a folder and split the file, one file for each entity should do the work

// Users
router.post('/users/register/', userController.create);
router.post('/users/login/', userController.login);
router.get('/users/', userController.index);


// Verified routes
router.get('/users/connectedUser/', verify, userController.connectedUser);
router.get('/users/connectedUser/scales', verify, userController.scales);
router.get('/users/connectedUser/progress', verify, userController.progress);
router.get('/users/connectedUser/badges', verify, userController.badges);
router.get('/users/connectedUser/answers', verify, userController.answers);
router.get('/users/logout/', verify, userController.login);
router.post('/users/connectedUser/preferences/update', verify, userController.updatePreferences);


// Cards
router.get('/cards/getOne', verify, cardsController.getOne);
router.get('/cards/stats', verify, cardsController.stats);
router.post('/cards/', verify, upload.single('file'), cardsController.create);
router.post('/cards/edit/:id', verify, cardsController.editCard);
router.get('/cards/delete/:id', cardsController.deleteCard);
router.get('/cards/deleteAll', verify, cardsController.deleteAll);

// UserCards
router.get('/userCards', verify, userCardsController.train);
router.get('/userCards/absorb/:id', verify, userCardsController.absorb);
router.get('/userCards/resorb/:userCardId', verify, userCardsController.resorb);
router.get('/userCards/list/:_id', verify, userCardsController.list);
router.get('/userCards/transfert/:_id', verifyDevelopper, userCardsController.transfert);
router.post('/userCards/getOne', verify, userCardsController.reviewOne);
router.post('/userCards/absorbMany', verify, userCardsController.absorbMany);
router.post('/userCards/update/:id', verify, userCardsController.update);


router.get('/userCards/categories', verify, categoriesController.categories);
router.post('/userCards/categories', verify, categoriesController.createCategory);
// Admin cards
router.post('/seed', verifyDevelopper, seeder.seed);
router.post('/badge', verifyDevelopper, badgeController.create);


export default router
