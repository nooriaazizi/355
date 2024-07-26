// Import the Express.js module
const express = require('express');

// Import the Axios module for making HTTP requests
const axios = require('axios');

// Import the express-session module for managing sessions
const session = require('express-session');

// Create an instance of an Express application
const app = express();

// Set the view engine to EJS for rendering views
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: false }));

// Set up session middleware with a secret key
app.use(session({
  secret: 'your-secret-key',  // Secret key for session encryption
  resave: false,              // Do not save session if unmodified
  saveUninitialized: true     // Save uninitialized session
}));

// Categories mapping for trivia questions
const categories = {
  'General Knowledge': 9,
  'Entertainment: Books': 10,
  'Entertainment: Film': 11,
  'Entertainment: Music': 12,
  'Entertainment: Musicals & Theatres': 13,
  'Entertainment: Television': 14,
  'Entertainment: Video Games': 15,
  'Entertainment: Board Games': 16,
  'Science & Nature': 17,
  'Science: Computers': 18,
  'Science: Mathematics': 19,
  'Mythology': 20,
  'Sports': 21,
  'Geography': 22,
  'History': 23,
  'Politics': 24,
  'Art': 25,
  'Celebrities': 26,
  'Animals': 27,
  'Vehicles': 28,
  'Entertainment: Comics': 29,
  'Science: Gadgets': 30,
  'Entertainment: Japanese Anime & Manga': 31,
  'Entertainment: Cartoon & Animations': 32
};

// Handle GET request to the root URL
app.get('/', (req, res) => {
  res.render('index', { categories });  // Render the index view and pass the categories object
});

// Handle POST request to /trivia for starting a trivia game
app.post('/trivia', async (req, res) => {
  const { amount, category, difficulty } = req.body;  // Extract form data from request body
  // Fetch trivia questions from the Open Trivia Database API
  const response = await axios.get(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}`);
  const questions = response.data.results;  // Extract questions from the API response
  req.session.questions = questions;        // Save questions in the session
  req.session.currentQuestion = 0;          // Initialize current question index
  req.session.score = 0;                    // Initialize score
  req.session.totalGames = (req.session.totalGames || 0) + 1;  // Increment total games played
  req.session.correctAnswers = (req.session.correctAnswers || 0);  // Initialize correct answers count if not already set
  res.redirect('/question');                // Redirect to the /question route
});

// Handle GET request to /question to display a trivia question
app.get('/question', (req, res) => {
  const { questions, currentQuestion, score, totalGames } = req.session;  // Extract session data
  if (!questions || currentQuestion >= questions.length) {
    return res.redirect('/result');  // Redirect to /result if no more questions
  }
  const question = questions[currentQuestion];  // Get the current question
  // Randomly shuffle the options
  const options = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
  // Render the trivia view and pass the question data
  res.render('trivia', { question, options, currentIndex: currentQuestion + 1, totalQuestions: questions.length, score, totalGames });
});

// Handle POST request to /answer to submit an answer
app.post('/answer', (req, res) => {
  const { answer } = req.body;  // Extract the submitted answer from the request body
  const { questions, currentQuestion } = req.session;  // Extract session data
  const correctAnswer = questions[currentQuestion].correct_answer;  // Get the correct answer for the current question

  if (answer === correctAnswer) {
    req.session.score++;          // Increment score if the answer is correct
    req.session.correctAnswers++;  // Increment correct answers count
  }
  req.session.currentQuestion++;  // Move to the next question
  res.redirect('/question');      // Redirect to the /question route
});

// Handle GET request to /result to display the results
app.get('/result', (req, res) => {
  const { score, questions, totalGames, correctAnswers } = req.session;  // Extract session data
  const totalQuestions = questions.length * totalGames;  // Calculate total questions across all games
  const cumulativeScore = correctAnswers;  // Get the cumulative score

  // Render the result view and pass the result data
  res.render('result', { score, totalQuestions, totalGames, cumulativeScore });
});

// Define the port to listen on
const PORT = 3007;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);  // Log a message when the server starts
});
