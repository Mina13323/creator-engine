const express = require('express');
const app = express();

app.get('/api/projects/:id', (req, res) => {
  res.send('ID route: ' + req.params.id);
});

app.get('/api/projects', (req, res) => {
  res.send('List route');
});

const request = require('supertest');

request(app)
  .get('/api/projects')
  .end((err, res) => {
    console.log('GET /api/projects ->', res.text);
    request(app)
      .get('/api/projects/123')
      .end((err, res2) => {
        console.log('GET /api/projects/123 ->', res2.text);
      });
  });
