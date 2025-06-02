const express = require('express');
const router = express.Router();
const pool = require('../config/db');


router.get('/students', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const search = req.query.search || '';

  try {
    const result = await pool.query(
      'SELECT id, full_name, iin FROM students WHERE LOWER(full_name) LIKE LOWER($1) ORDER BY full_name',
      [`%${search}%`]
    );

    res.render('students', {
      user: req.session.user,
      students: result.rows,
      search
    });
  } catch (err) {
    console.error('Ошибка при получении студентов:', err);
    res.status(500).send('Ошибка сервера');
  }
});


router.get('/students/add', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('add_student', { error: null });
});


router.post('/students/add', async (req, res) => {
  const {
    full_name,
    iin,
    email,
    phone,
    status,
    top_student,
    funding_source,
    subject,
    total_cost,
    discount_percent,
    paid_amount
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO students (
        full_name, iin, email, phone, status, top_student,
        funding_source, subject, total_cost, discount_percent,
        paid_amount, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, NOW()
      )`,
      [
        full_name,
        iin,
        email,
        phone,
        status,
        top_student === 'on', 
        funding_source,
        subject,
        total_cost || 0,
        discount_percent || 0,
        paid_amount || 0
      ]
    );

    res.redirect('/students');
  } catch (err) {
    console.error('Ошибка при добавлении студента:', err);
    res.render('add_student', { error: 'Ошибка при добавлении. Проверьте данные.' });
  }
});

module.exports = router;

router.post('/students/delete/:id', async (req, res) => {
  const studentId = req.params.id;

  try {
    await pool.query('DELETE FROM students WHERE id = $1', [studentId]);
    res.redirect('/students');
  } catch (err) {
    console.error('Ошибка при удалении студента:', err);
    res.status(500).send('Ошибка сервера при удалении');
  }
});

router.get('/students/edit/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    const student = result.rows[0];
    if (!student) return res.redirect('/students');

    res.render('edit_student', { student, error: null });
  } catch (err) {
    console.error('Ошибка при загрузке студента:', err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/students/edit/:id', async (req, res) => {
  const id = req.params.id;
  const {
    full_name,
    iin,
    email,
    phone,
    status,
    top_student,
    funding_source,
    subject,
    total_cost,
    discount_percent,
    paid_amount
  } = req.body;

  try {
    await pool.query(
      `UPDATE students SET
        full_name = $1,
        iin = $2,
        email = $3,
        phone = $4,
        status = $5,
        top_student = $6,
        funding_source = $7,
        subject = $8,
        total_cost = $9,
        discount_percent = $10,
        paid_amount = $11
      WHERE id = $12`,
      [
        full_name,
        iin,
        email,
        phone,
        status,
        top_student === 'on',
        funding_source,
        subject,
        total_cost || 0,
        discount_percent || 0,
        paid_amount || 0,
        id
      ]
    );
    res.redirect('/students');
  } catch (err) {
    console.error('Ошибка при обновлении:', err);
    res.render('edit_student', { student: req.body, error: 'Ошибка при обновлении. Проверьте данные.' });
  }
});