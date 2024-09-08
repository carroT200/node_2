const fs = require('fs');
const helper = require('./helper');

let articles = [];

function loadArticles() {
  fs.readFile('articles.json', 'utf-8', (err, data) => {
    if (err) throw err;
    articles = JSON.parse(data);
  });
}

function updateArticlesFile() {
  fs.writeFile('articles.json', JSON.stringify(articles, null, 2), (err) => {
    if (err) console.error('Failed to update articles:', err);
  });
}

function logRequest(req, body) {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${
    req.url
  } - Body: ${JSON.stringify(body)}`;
  fs.appendFile('server.log', logEntry + '\n', (err) => {
    if (err) console.error('Failed to write log:', err);
  });
}

function readAllArticles(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(articles));
  logRequest(req, null);
}

function readArticle(req, res, params) {
  const article = articles.find((a) => a.id == params.id);
  if (article) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(article));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ code: 404, message: 'Article not found' }));
  }
  logRequest(req, null);
}

function createArticle(req, res) {
  helper.parseBody(req, (err, body) => {
    if (!body.title || !body.text || !body.author) {
      res.statusCode = 400;
      res.end(JSON.stringify({ code: 400, message: 'Request invalid' }));
      return;
    }

    const newArticle = {
      id: articles.length + 1,
      title: body.title,
      text: body.text,
      date: Date.now(),
      author: body.author,
      comments: [],
    };

    articles.push(newArticle);
    updateArticlesFile();
    res.statusCode = 201;
    res.end(JSON.stringify(newArticle));
    logRequest(req, body);
  });
}

function updateArticle(req, res, params) {
  helper.parseBody(req, (err, body) => {
    const article = articles.find((a) => a.id == params.id);
    if (article) {
      article.title = body.title || article.title;
      article.text = body.text || article.text;
      article.date = Date.now();
      updateArticlesFile();
      res.end(JSON.stringify(article));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ code: 404, message: 'Article not found' }));
    }
    logRequest(req, body);
  });
}

function deleteArticle(req, res, params) {
  articles = articles.filter((a) => a.id != params.id);
  updateArticlesFile();
  res.end(JSON.stringify({ message: 'Article deleted' }));
  logRequest(req, null);
}

function createComment(req, res) {
  helper.parseBody(req, (err, body) => {
    const article = articles.find((a) => a.id == body.articleId);
    if (article) {
      const newComment = {
        id: Date.now(),
        articleId: body.articleId,
        text: body.text,
        date: Date.now(),
        author: body.author,
      };
      article.comments.push(newComment);
      updateArticlesFile();
      res.end(JSON.stringify(newComment));
      logRequest(req, body);
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ code: 404, message: 'Article not found' }));
    }
  });
}

function deleteComment(req, res, params) {
  const article = articles.find((a) =>
    a.comments.some((c) => c.id == params.id)
  );
  if (article) {
    article.comments = article.comments.filter((c) => c.id != params.id);
    updateArticlesFile();
    res.end(JSON.stringify({ message: 'Comment deleted' }));
    logRequest(req, null);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ code: 404, message: 'Comment not found' }));
  }
}

module.exports = {
  readAllArticles,
  readArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  createComment,
  deleteComment,
};
