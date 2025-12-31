const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Дозволяє запити з React (localhost:5173) на Node (localhost:5000)
app.use(express.json()); // Дозволяє читати JSON у запитах

// Імпорт роутів
const generateRoute = require('./routes/generate');
// const userRoute = require('./routes/user'); // Розкоментуєш, коли створиш
// const projectsRoute = require('./routes/projects');

// Використання роутів
app.use('/api/generate', generateRoute);
// app.use('/api/users', userRoute);

// Запуск сервера
app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});