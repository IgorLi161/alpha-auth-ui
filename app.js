const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'alphaSecretKey',
  resave: false,
  saveUninitialized: false
}));

app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
