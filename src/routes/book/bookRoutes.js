const express = require('express');
const bookController = require('../../controllers/book/bookController');
const authenticate = require('../../middlewares/authenticate');
const upload = require('../../middlewares/multerConfig');
const authenticateToken = require('../../middlewares/authenticateToken');

const router = express.Router();
// router.use(authenticate);

router.get('/books', bookController.getBooks);
router.post('/books', bookController.createBook);
router.get('/categories', bookController.getCategories);
// router.post('/upload-book', upload.single('coverPicture'), bookController.uploadBook);
router.post('/upload-book', authenticate, upload.single('coverPicture'), bookController.uploadBook);

module.exports = router;
