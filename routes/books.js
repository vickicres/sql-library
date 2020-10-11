const express = require('express');
const router = express.Router();
const Book = require('../models').Book; //import book model

//Middleware handler 
function asyncHandler(callback){
  return async(req, res, next) => {
      try {
        await callback(req, res, next)
      } catch(error){ 
        res.status = 404;
        next(error);
      }
  }
}

/* GET all the books */
router.get('/', asyncHandler(async (req, res) => {
  // get all books from the library database
  const books = await Book.findAll({ 
    order: [[ 'title', 'ASC' ]]  // order by title
  });
  res.render("books/index", { books } );
}));

/* GET create new book form */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {} });
});

/* POST Submits form and create a new book. */
router.post('/new', asyncHandler(async (req, res) => {
      let book;
      try {
        book = await Book.create(req.body);  
        res.redirect("/books/" + book.id);   
      } catch (error) {
        if(error.name === "SequelizeValidationError") {
          book = await Book.build(req.body);
          res.render("books/form-error", { book, errors: error.errors})
        } else {
          throw error; 
        }
      }
  }));

/* GET /books/:id - Shows more details from the book. */
router.get('/:id', asyncHandler(async (req, res, next) => {
    // find book by id
    const book = await Book.findByPk(req.params.id);
    if(book) { 
        res.render("books/update-book", { book }); 
    } else { 
        const err = new Error();
        err.status = 400;
        next(err);
    }
}));

/* POST /books/:id/ - Update a book.  */
router.post('/:id', asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id); //find book by id
      if(book) {
        await book.update(req.body); // if book id exists, update the Book properties
        res.redirect("/books/" + book.id); 
    } else { 
        const err = new Error();
        err.status = 400;
        next(err);
    }
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; 
        res.render("books/update-book", { book, errors: error.errors})
      } else {
        throw error;
      }
    }
}));

/* GET  Deletes a book form  */
router.get('/:id/delete', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id); 
    if(book) {
      res.render("books/delete", { book }); 
    } else {
      res.sendStatus(404);
    }

}));

/* POST  Deletes a book.  */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      await book.destroy(); // delete the book
      res.redirect("/books"); // redirect back to the main list
    } else {
      res.sendStatus(404);
    }
}));

module.exports = router;