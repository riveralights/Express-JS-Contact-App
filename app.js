// load node modules express
const express = require('express');

// load express ejs layouts
const expressLayouts = require('express-ejs-layouts');

// ambil beberapa modules dari contacts.js
const { loadContact, findContact, addContact, checkDuplicate, deleteContact, updateContact } = require('./utils/contacts');

// load modules express-validator untuk validasi form
const { body, validationResult, check } = require('express-validator');

// module untuk session, cookie, dan flash message
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// panggil express sebagai app
const app = express();
// set port nya
const port = 3000;

// gunakan ejs
app.set('view engine', 'ejs');
// gunakan express layout
app.use(expressLayouts);

// Built in middleware - agar file static folder public bisa diakses
app.use(express.static('public'))

// untuk memparsing request
app.use(express.urlencoded({extended: true}));

// konfigurasi untuk cookie, session, dan flash message
app.use(cookieParser('secret'));
app.use(session({
    cookie: {
        maxAge: 6000,
    },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());

// Route '/'
app.get('/', (req, res) => {
    // array of object Mahasiswa
    const mahasiswa = [
        {
            nama: "Fuad Muhammad Nur",
            email: "fuadmhnr@yahoo.com"
        },
        {
            nama: "Alica Putri Azzahra",
            email: "alica@yahoo.com"
        },
        {
            nama: "Ilham Fadhillah",
            email: "ilham@yahoo.com"
        },
    ]

    // render index.ejs sembari kirim variabel
    res.render('index', {
        website: "Website Sederhana", // variable website
        title: "Home Page", // variable title
        layout: 'layouts/app', // definisikan wrapper layoutnya
        mahasiswa //  variable mahasiswa
    });
});

// Route '/contacts'
app.get('/about', (req, res) => {

    // render about.ejs sembari kirim variabel
    res.render('about', {
        layout: 'layouts/app', // definisikan wrapper layoutnya
        title: "About Page" // variable title
    });
});

// Route '/contacts'
app.get('/contact', (req, res) => {
    // tarik semua data contacts
    const contacts = loadContact();

    // render contact.ejs sembari kirim variabel
    res.render('contact', {
        layout: 'layouts/app', // definisikan wrapper layoutnya
        title: "Contact us", // variable title
        contacts: contacts, // variable contacts
        msg: req.flash('msg'), // variable msg isinya pesan dari flash message
    });
});


// Route '/contacts/add' untuk menampilkan form tambah
app.get('/contact/add', (req, res) => {
    // render contact-add.ejs sembari kirim variabel
    res.render('add-contact', {
        layout: 'layouts/app', // definisikan wrapper layoutnya
        title: 'Form Tambah Data Contact' // variable title
    })
})

// Route '/contact' untuk proses tambah data
app.post('/contact', [
    // custom validation untuk name
    body('nama').custom((value) => {
        // passing value ke function checkDuplicate
        const duplicateData = checkDuplicate(value);
        // kalo ada duplikasi data
        if(duplicateData) {
            // lempar error
            throw new Error('Nama sudah digunakan!');
        }
        // kalo gak ada error, return true aja 
        return true; 
    }),
    // validasi buat email + custom message
    check('email', 'Email tidak valid').isEmail(),
    // validasi buat telepon + custom message
    check('phone', 'Nomor telepon tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
    // ambil semua error dari requestnya
    const errors = validationResult(req);
    // kalo ada error
    if(!errors.isEmpty()) {
        // lempar ke halaman add-contact.ejs dengan pesan error
        res.render('add-contact', {
            layout: 'layouts/app',
            title: 'Form Tambah Data Contact',
            errors: errors.array(),
        });
    } else {
        // save semua data dari body request
        addContact(req.body);
        // kirimkan flash message
        req.flash('msg', 'Data kontak berhasil ditambahkan');
        // redirect ke contact
        res.redirect('/contact');
    }
})

// Route '/contact/delete/:id' untuk delet data
app.get('/contact/delete/:nama', (req, res) => {
    // cari data yang namanya sama dengan nama yang dikirim
    const contact = findContact(req.params.nama);

    // jika data tidak ditemukan
    if(!contact) {
        // kasih http status 404 - render Pesan Tidak Ditemukan
        res.status(404).send('<h4>Data tidak ditemukan</h4>');
    } else { // jika data ditemukan
        // hapus data kontak yang namanya sama dengan nama yang dikirim
        deleteContact(req.params.nama);
        // kirimkan flash message
        req.flash('msg', 'Data kontak berhasil dihapus');
        // redirect to contact
        res.redirect('/contact');
    }
});

// Route '/contact/edit/:nama' untuk menampilkan form edit
app.get('/contact/edit/:nama', (req, res) => {
    // cari data yang namanya sama dengan nama yang dikirim
    const contact = findContact(req.params.nama);
    // render form edit-contact.ejs dengan mengirim data kontak
    res.render('edit-contact', {
        layout: 'layouts/app',
        title: 'Form Ubah Data Contact',
        contact,
    })
});

// Proses Update Data Contact
app.post('/contact/update', [
    // custom validasi untuk nama
    body('nama').custom((value, { req }) => {
        // passing value ke function checkDuplicate
        const duplicateData = checkDuplicate(value);
        // cek, apakah value yang kirim tidak sama dengan req.body.oldNama dan datanya duplikat
        if(value !== req.body.oldNama && duplicateData) { // kalo ada
            // kasih error
            throw new Error('Nama sudah digunakan!');
        }
        // kalau gak ada, return true
        return true; 
    }),
    // validasi buat email + custom message
    check('email', 'Email tidak valid').isEmail(),
    // validasi buat phone + custom message
    check('phone', 'Nomor telepon tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
    // tarik semua errors dari request
    const errors = validationResult(req);
    // kalo ada error
    if(!errors.isEmpty()) {
        // redirect ke halaman edit-contact.ejs dengan pesan error
        res.render('edit-contact', {
            layout: 'layouts/app',
            title: 'Form Edit Data Contact',
            errors: errors.array(),
            contact: req.body // kirimkan data kontak yang telah diubah
        });
    } else { // kalo gak ada error
        // update data dengan data dari request body
        updateContact(req.body);
        // // kirimkan flash message
        req.flash('msg', 'Data kontak berhasil diubah');
        // // redirect to contact
        res.redirect('/contact');
    }
})


// Route '/contact/:nama' untuk menampilkan detail data
app.get('/contact/:nama', (req, res) => {
    // cari data yang namanya sama dengan nama yang dikirim
    const contact = findContact(req.params.nama);

    // render detail.ejs dengan mengirim data kontak
    res.render('detail', {
        layout: 'layouts/app',
        title: "Detail Contacts",
        contact,
    });
});

// Middleware untuk invalid route URL
app.use('/', (req, res) => {
    res.status(404);
    res.send('<h1>404 - Page Not Found </h1>');
});

// jalankan aplikasi pada port 3000
app.listen(port, () => {
    // notifikasikan ke konsol
    console.log(`Listening at http://localhost:${port}`);
});