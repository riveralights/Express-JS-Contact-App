// Core Module
// File System
const fs = require("fs");

// alamat direktori
const dirPath = "./data";

// Cek, kalo direktori target nya gak ada
if (!fs.existsSync(dirPath)) {
  // buatin direktori data
  fs.mkdirSync(dirPath);
}

// alamat file contacts.json
const dataPath = "./data/contacts.json";

//Cek, kalo file contacts.json nya enggak ada
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

// load semua contacts
const loadContact = () => {
  // baca file contacts.json
  const fileBuffer = fs.readFileSync("data/contacts.json", "utf-8");

  // ubah menjadi bentuk json
  const contacts = JSON.parse(fileBuffer);

  // kembalikan contacts
  return contacts;
}

// Mencari kontak berdasarkan nama
const findContact = (nama) => {
  // load semua contacts
  const contacts = loadContact();
  // cari data kontak yang namanya sama.
  const contact = contacts.find((contact) => contact.nama.toLowerCase() === nama.toLowerCase());
  // kembalikan kontak
  return contact;
}

// tulis / timpa file contacts.json dengan data baru
const saveContacts = (contacts) => {
  // contacts di parameter itu object object
  // konversi object to string, lalu timpa data/contacts.json
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
}

// Tambah kontak baru
const addContact = (contact) => {
  // load semua contacts
  const contacts = loadContact();
  // tambah kontak baru ke dalam array contacts
  contacts.push(contact);
  // simpan kontak baru
  saveContacts(contacts);
}

// check duplikasi data
const checkDuplicate = (nama) => {
  // load semua contacts
  const contacts = loadContact();
  // kembalikan nama kontak yang sama dengan nama yang dikirim dari parameter
  return contacts.find((contact) => contact.nama === nama);
}

// hapus kontak berdasarkan nama
const deleteContact = (nama) => {
  // load semua contacts
   const contacts = loadContact();
   // hilangkan contact lama yang namanya sama dengan nama yang dikirim dari parameter
   const filteredContacts = contacts.filter((contact) => contact.nama !== nama);
   // timpa file contacts.json dengan data baru
   saveContacts(filteredContacts);
}

// mengubah contacts
const updateContact = (contactBaru) => {
  const contacts = loadContact();
  // hilangkan contact lama yang namanya sama dengan oldNama
  const filteredContacts = contacts.filter((contact) => contact.nama !== contactBaru.oldNama);
  delete contactBaru.oldNama;
  // tambahkan contact baru
  filteredContacts.push(contactBaru);
  // timpa file contacts.json dengan data baru
  saveContacts(filteredContacts);
}

module.exports = { loadContact, findContact, addContact, checkDuplicate, deleteContact, updateContact }