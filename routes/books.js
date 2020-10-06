var express = require('express');
var router = express.Router();
var Book = require('../models').Book;

/* call back function */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* List all books. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({
    order:[['createdAt', 'DESC']]
  });
  res.send('books/index', {books, title:"Collection of Books"} );
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render('books/new-book', { book: {}, title: 'New Book' })
});

/* POST create books. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/new-book', { book, errors: error.errors, title: 'New Book' })
    } else {
      throw error;
    }
  }
}));


/* GET individual book. */
router.get('/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('books/update-book', { book, title: book.title });
  } else {
    res.sendStatus(404);
  }
}));


/* Edit/update a books. */
router.get('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books');
  } catch (err) {
    if (err.name = "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('books/update-book', { book, errors: err.errors, title: 'Update Book' });
    } else {
      throw err;
    }
  }
}));

/* Delete books form. */
router.post('/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id)
  await book.destory();
  res.redirect('/books');

}));



module.exports = router;
