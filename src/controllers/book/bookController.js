const prisma = require("../../database");

async function getBooks(req, res) {
  try {
    const books = await prisma.book.findMany({
      include: {
        category: true,
      },
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

    if (!name || !author || !categoryId) {
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
        name: name,
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

async function getAllUploadedBooks(req, res) {
  try {
    const books = await prisma.bookOnUser.findMany({
      include: {
        book: {
          include: {
            category: true,
          },
        },
        user: true,
      },
    });

    res.json(books);
  } catch (error) {
    console.error("Error retrieving books:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function changeBookStatus(req, res) {
  try {
    const { bookId } = req.body;

    const book = await prisma.bookOnUser.findFirst({
      where: {
        id: bookId,
      },
    });

    const updatedBookOnUser = await prisma.bookOnUser.update({
      where: { id: bookId },
      data: {
        isApproved: !book.isApproved,
      },
      include: {
        book: {
          include: {
            category: true,
          },
        },
        user: true,
      },
    });

    res.json(updatedBookOnUser);
  } catch (error) {
    console.error("Error changing book status:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getAllAvailableBooksByCategory(req, res) {
    try {
      const categoriesWithBooks = await prisma.category.findMany({
        include: {
          books: {
            where: {
              owners: {
                some: {
                  isApproved: true,
                  user: {
                    isActive: true,
                    isApprovedBookOwner: true
                  }
                }
              }
            },
            include: {
              owners: {
                where: {
                  isApproved: true,
                  user: {
                    isActive: true,
                    isApprovedBookOwner: true
                  }
                }
              }
            }
          }
        }
      });
  
      const result = categoriesWithBooks.map((category) => {
        const availableQuantity = category.books.reduce((total, book) => {
          const bookAvailableQuantity = book.owners.reduce((bookTotal, owner) => {
            return bookTotal + owner.availableQuantity;
          }, 0);
          return total + bookAvailableQuantity;
        }, 0);
  
        return {
          categoryId: category.id,
          categoryName: category.name,
          availableQuantity,
        };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the data." });
    }
  }  


  const getMonthRange = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startOfLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const endOfLastMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  
    return {
      startOfMonth,
      endOfMonth,
      startOfLastMonth,
      endOfLastMonth,
    };
  };
  
  async function getIncome(req, res){
    try {
      const today = new Date();
      const { startOfMonth, endOfMonth, startOfLastMonth, endOfLastMonth } = getMonthRange(today);
  
      // Fetch current month's income
      const currentMonthIncome = await prisma.rental.aggregate({
        _sum: {
          rentalPrice: true,
        },
        where: {
          rentedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
  
      // Fetch last month's income
      const lastMonthIncome = await prisma.rental.aggregate({
        _sum: {
          rentalPrice: true,
        },
        where: {
          rentedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      });
  
      // Calculate percentage change
      const currentIncome = currentMonthIncome._sum.rentalPrice || 0;
      const previousIncome = lastMonthIncome._sum.rentalPrice || 0;
      const percentageChange = ((currentIncome - previousIncome) / previousIncome) * 100;
  
      // Response data
      const data = {
        currentMonthIncome: currentIncome,
        lastMonthIncome: previousIncome,
        percentageChange: percentageChange.toFixed(2),
      };
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the data.' });
    }
  }
  
module.exports = {
  getBooks,
  createBook,
  getCategories,
  uploadBook,
  getAllUploadedBooks,
  changeBookStatus,
  getAllAvailableBooksByCategory,
  getIncome
};
