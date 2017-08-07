const express = require('express');
const app = express();
let rp = require('request-promise');
let TweetsFetcher = require('./fetch-tweets');

app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('tweets', {messages: []});
});

app.get('/search', function(req, res) {
  TweetsFetcher
  .fetchTweets(req.query,null, rp)
  .then(function(data) {
        console.log(JSON.stringify(data));
        res.render('tweets', {searchTitle: req.query.q , messages: data});
    }).catch(function(err) {
      console.error(err.message);
      res.json({error: err.message});
    });

})

app.listen(3000, function() {
  console.log('Example app listening on port 3000');
});
