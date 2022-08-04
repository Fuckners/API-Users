const express = require('express');
const router = express.Router();
const AdminAuth = require('../middlewares/AdminAuth');
const HomeController = require('../controllers/HomeController');
const UserController = require('../controllers/UserController');

router.get('/', HomeController.index);

router.get('/users', AdminAuth, UserController.findAllUsers);

router.get('/user/:param', AdminAuth, UserController.findOne);

router.post('/user', UserController.create);
// email + name + password + role

router.put('/user/:id', AdminAuth, UserController.update);
// email || name || role

router.delete('/user/:id', AdminAuth, UserController.remove);

router.get('/password/recover/:email', UserController.passwordRecover);

router.put('/password/change', UserController.passwordChange);
// email + password (new) + token

router.post('/login', UserController.login);
// email + password

router.post('/tokenValidate', AdminAuth, HomeController.tokenValidate);

module.exports = router