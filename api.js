const client = require('./connection.js');
const express = require('express');
const app = express();

app.use(express.json()); // Parsing JSON body

app.listen(3300, () => {
    console.log("Server is now listening at port 3300");
});

client.connect();

// Endpoint untuk mendapatkan semua buku
app.get('/Book', (req, res) => {
    client.query('SELECT * FROM public."Book"', (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err.message);
            res.status(500).send('Error fetching books');
        }
    });
});

// Endpoint untuk mendapatkan buku berdasarkan ID
app.get('/Book/:BookID', (req, res) => {
    const bookID = req.params.BookID;
    client.query('SELECT * FROM public."Book" WHERE "BookID"=$1', [bookID], (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err.message);
            res.status(500).send('Error fetching book');
        }
    });
});

// Endpoint untuk mendapatkan buku dari view BookDetails
app.get('/BookDetails', (req, res) => {
    client.query('SELECT * FROM public.BookDetails', (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err.message);
            res.status(500).send('Error fetching books');
        }
    });
});

// Endpoint untuk mendapatkan buku berdasarkan ID dari view BookDetails
app.get('/BookDetails/:BookID', (req, res) => {
    const bookID = req.params.BookID;
    client.query('SELECT * FROM public.BookDetails WHERE "BookID" = $1', [bookID], (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err.message);
            res.status(500).send('Error fetching book');
        }
    });
});

// Endpoint untuk menambahkan buku baru
app.post('/Book', (req, res) => {
    const book = req.body;
    const insertQuery = `
        INSERT INTO public."Book"("BookID", "BookName", "ISBN", "Pages", "LanguageID", "FormatID", "PublisherID", "PublicationYear") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
        book.BookID,
        book.BookName,
        book.ISBN,
        book.Pages,
        book.LanguageID,
        book.FormatID,
        book.PublisherID,
        book.PublicationYear
    ];

    client.query('BEGIN', err => {
        if (err) {
            console.log('Error starting transaction:', err.message);
            res.status(500).send('Error starting transaction');
            return;
        }

        client.query(insertQuery, values, (err, result) => {
            if (!err) {
                client.query('COMMIT', err => {
                    if (err) {
                        console.log('Error committing transaction:', err.message);
                        res.status(500).send('Error committing transaction');
                    } else {
                        res.send('Insertion was successful');
                    }
                });
            } else {
                console.log('Error inserting book:', err.message);
                client.query('ROLLBACK', err => {
                    if (err) {
                        console.log('Error rolling back transaction:', err.message);
                    }
                    res.status(500).send('Error inserting book');
                });
            }
        });
    });
});

// Endpoint untuk melakukan update data pada buku
app.put('/Book/:BookID', (req, res) => {
    const bookID = req.params.BookID;
    const updatedBook = req.body;

    const updateQuery = `
        UPDATE public."Book"
        SET "BookName"=$1, "ISBN"=$2, "Pages"=$3, "LanguageID"=$4, "FormatID"=$5, "PublisherID"=$6, "PublicationYear"=$7
        WHERE "BookID"=$8
    `;
    const values = [
        updatedBook.BookName, updatedBook.ISBN, updatedBook.Pages,
        updatedBook.LanguageID, updatedBook.FormatID,
        updatedBook.PublisherID, updatedBook.PublicationYear, bookID
    ];

    client.query('BEGIN', err => {
        if (err) {
            console.log('Error starting transaction:', err.message);
            res.status(500).send('Error starting transaction');
            return;
        }

        client.query(updateQuery, values, (err, result) => {
            if (!err) {
                client.query('COMMIT', err => {
                    if (err) {
                        console.log('Error committing transaction:', err.message);
                        res.status(500).send('Error committing transaction');
                    } else {
                        res.send('Update was successful');
                    }
                });
            } else {
                console.log('Error updating book:', err.message);
                client.query('ROLLBACK', err => {
                    if (err) {
                        console.log('Error rolling back transaction:', err.message);
                    }
                    res.status(500).send('Error updating book');
                });
            }
        });
    });
});

// Endpoint untuk menghapus data buku
app.delete('/Book/:BookID', (req, res) => {
    const bookID = req.params.BookID;
    const deleteQuery = `
        DELETE FROM public."Book" WHERE "BookID"=$1
    `;

    client.query('BEGIN', err => {
        if (err) {
            console.log('Error starting transaction:', err.message);
            res.status(500).send('Error starting transaction');
            return;
        }

        client.query(deleteQuery, [bookID], (err, result) => {
            if (!err) {
                client.query('COMMIT', err => {
                    if (err) {
                        console.log('Error committing transaction:', err.message);
                        res.status(500).send('Error committing transaction');
                    } else {
                        res.send('Deletion was successful');
                    }
                });
            } else {
                console.log('Error deleting book:', err.message);
                client.query('ROLLBACK', err => {
                    if (err) {
                        console.log('Error rolling back transaction:', err.message);
                    }
                    res.status(500).send('Error deleting book');
                });
            }
        });
    });
});

// Endpoint untuk mendapatkan semua Wishlist
app.get('/Wishlist', (req, res) => {
    client.query('SELECT * FROM public."Wishlist"', (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err.message);
            res.status(500).send('Error fetching wishlists');
        }
    });
});

// Endpoint untuk mendapatkan Wishlist berdasarkan WishlistID
app.get('/Wishlist/:WishlistID', (req, res) => {
    const wishlistID = req.params.WishlistID;
    client.query('SELECT * FROM public."Wishlist" WHERE "WishlistID" = $1', [wishlistID], (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err.message);
            res.status(500).send('Error fetching wishlist');
        }
    });
});

// Endpoint untuk menambahkan wishlist baru
app.post('/Wishlist', (req, res) => {
    const wishlist = req.body;
    const insertQuery = `
        INSERT INTO public."Wishlist"("WishlistID", "WishlistDate", "BookID", "CustomerID") 
        VALUES ($1, $2, $3, $4)
    `;
    const values = [
        wishlist.WishlistID,
        wishlist.WishlistDate,
        wishlist.BookID,
        wishlist.CustomerID
    ];

    client.query('BEGIN', err => {
        if (err) {
            console.log('Error starting transaction:', err.message);
            res.status(500).send('Error starting transaction');
            return;
        }

        client.query(insertQuery, values, (err, result) => {
            if (!err) {
                client.query('COMMIT', err => {
                    if (err) {
                        console.log('Error committing transaction:', err.message);
                        res.status(500).send('Error committing transaction');
                    } else {
                        res.send('Insertion to wishlist was successful');
                    }
                });
            } else {
                console.log('Error inserting to wishlist:', err.message);
                client.query('ROLLBACK', err => {
                    if (err) {
                        console.log('Error rolling back transaction:', err.message);
                    }
                    res.status(500).send('Error inserting to wishlist');
                });
            }
        });
    });
});

// Endpoint untuk memperbarui Wishlist berdasarkan WishlistID
app.put('/Wishlist/:WishlistID', (req, res) => {
    const wishlistID = req.params.WishlistID;
    const { WishlistDate, BookID, CustomerID } = req.body;

    const updateQuery = `
        UPDATE public."Wishlist"
        SET "WishlistDate" = $1, "BookID" = $2, "CustomerID" = $3
        WHERE "WishlistID" = $4
    `;
    const values = [WishlistDate, BookID, CustomerID, wishlistID];

    client.query('BEGIN', err => {
        if (err) {
            console.log('Error starting transaction:', err.message);
            res.status(500).send('Error starting transaction');
            return;
        }

        client.query(updateQuery, values, (err, result) => {
            if (!err) {
                client.query('COMMIT', err => {
                    if (err) {
                        console.log('Error committing transaction:', err.message);
                        res.status(500).send('Error committing transaction');
                    } else {
                        res.send('Update was successful');
                    }
                });
            } else {
                console.log('Error updating wishlist:', err.message);
                client.query('ROLLBACK', err => {
                    if (err) {
                        console.log('Error rolling back transaction:', err.message);
                    }
                    res.status(500).send('Error updating wishlist');
                });
            }
        });
    });
});

// Endpoint untuk menghapus Wishlist berdasarkan WishlistID
app.delete('/Wishlist/:WishlistID', (req, res) => {
    const wishlistID = req.params.WishlistID;
    const deleteQuery = `
        DELETE FROM public."Wishlist" WHERE "WishlistID" = $1
    `;

    client.query('BEGIN', err => {
        if (err) {
            console.log('Error starting transaction:', err.message);
            res.status(500).send('Error starting transaction');
            return;
        }

        client.query(deleteQuery, [wishlistID], (err, result) => {
            if (!err) {
                client.query('COMMIT', err => {
                    if (err) {
                        console.log('Error committing transaction:', err.message);
                        res.status(500).send('Error committing transaction');
                    } else {
                        res.send('Deletion was successful');
                    }
                });
            } else {
                console.log('Error deleting wishlist:', err.message);
                client.query('ROLLBACK', err => {
                    if (err) {
                        console.log('Error rolling back transaction:', err.message);
                    }
                    res.status(500).send('Error deleting wishlist');
                });
            }
        });
    });
});

// Endpoint untuk mendapatkan semua data dari view CustomerWishlist
app.get('/CustomerWishlist', (req, res) => {
    client.query('SELECT * FROM public.CustomerWishlist', (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log('Error fetching customer wishlist:', err.message);
            res.status(500).send('Error fetching customer wishlist');
        }
    });
});

// Endpoint untuk mendapatkan data berdasarkan CustomerID dari view CustomerWishlist
app.get('/CustomerWishlist/:CustomerID', (req, res) => {
    const customerID = req.params.CustomerID;
    client.query('SELECT * FROM public.CustomerWishlist WHERE "CustomerID" = $1', [customerID], (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log('Error fetching customer wishlist:', err.message);
            res.status(500).send('Error fetching customer wishlist');
        }
    });
});
