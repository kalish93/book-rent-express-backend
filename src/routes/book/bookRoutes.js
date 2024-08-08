const express = require('express');
const bookController = require('../../controllers/book/bookController');
const authenticate = require('../../middlewares/authenticate');
const upload = require('../../middlewares/multerConfig');

const router = express.Router();
// router.use(authenticate);

router.get('/books', bookController.getBooks);
router.post('/books', bookController.createBook);
router.get('/categories', bookController.getCategories);
router.post('/upload-book', authenticate, upload.single('coverPicture'), bookController.uploadBook);
router.get('/all-uploaded-books', authenticate, bookController.getAllUploadedBooks);
router.put('/change-book-status', authenticate, bookController.changeBookStatus);
router.get('/all-books-by-category', authenticate, bookController.getAllAvailableBooksByCategory);
router.get('/all-books-by-category', authenticate, bookController.getAllAvailableBooksByCategory);
router.get('/income-by-month', authenticate, bookController.getIncome );

module.exports = router;
