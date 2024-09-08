const http = require('http');
const helper = require('./helper');
const controllers = require('./controllers');
const fs = require('fs');

// Загружаем статьи из файла
let articles = [];

function loadArticles() {
  return new Promise((resolve, reject) => {
    fs.readFile('articles.json', 'utf-8', (err, data) => {
      if (err) reject(err);
      articles = JSON.parse(data);
      resolve();
    });
  });
}

const server = http.createServer(handler);

loadArticles()
  .then(() => {
    server.listen(3000, '127.0.0.1', () => {
      console.log('Server is running on http://127.0.0.1:3000');
    });
  })
  .catch((err) => {
    console.error('Failed to load articles:', err);
  });

const endpointMapper = {
  '/api/articles/readall': controllers.readAllArticles,
  '/api/articles/read': controllers.readArticle,
  '/api/articles/create': controllers.createArticle,
  '/api/articles/update': controllers.updateArticle,
  '/api/articles/delete': controllers.deleteArticle,
  '/api/comments/create': controllers.createComment,
  '/api/comments/delete': controllers.deleteComment,
};

function handler(req, res) {
  const { url, params } = helper.parseUrl(req.url);
  const handler = endpointMapper[url];

  if (handler) {
    handler(req, res, params);
  } else {
    send404(req, res);
  }
}

function send404(req, res) {
  res.statusCode = 404;
  res.end(JSON.stringify({ code: 404, message: 'Page Not Found' }));
}
