const prisma = require('../../database');

async function getBooks(req, res) {
  try {
      const books = await prisma.book.findMany({
        include:{
            category: true
        }
      });


    res.json(books);
  } catch (error) {
    console.error("Error retrieving books:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function createBook(req, res) {
  try {
    const { name, author, categoryId } = req.body;

    if (!name || !author || !categoryId ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingBook = await prisma.book.findFirst({
      where: {
        name,
      },
    });

    if (existingBook) {
      return res.status(400).json({
        error: "Book already exists",
      });
    }

    const createdBook = await prisma.book.create({
      data: {
        name:name,
        author: author,
        categoryId: categoryId,
      },
    });

    res.json(createdBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getCategories(req, res) {
    try {
        const categories = await prisma.category.findMany();
  
  
      res.json(categories);
    } catch (error) {
      console.error("Error retrieving categories:", error);
      res.status(500).send("Internal Server Error");
    }
  }

async function uploadBook(req, res) {
    try {

      const { bookId, quantity, price } = req.body;
      const coverPicture = req.file ? req.file.filename : null; // File path or null if no file
  
      if (!bookId || quantity === undefined || price === undefined) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const userId = req.user.id;
      const bookOnUser = await prisma.bookOnUser.create({
        data: {
          userId: userId,
          bookId: bookId,
          quantity: parseInt(quantity),
          availableQuantity: parseInt(quantity),
          price: parseFloat(price),
          coverPicture: coverPicture, // Save the file path in the database
        },
      });
  
      res.json(bookOnUser);
    } catch (error) {
      console.error("Error creating BookOnUser:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  
  
module.exports = {
    getBooks,
    createBook,
    getCategories,
    uploadBook
}