const key = 'YOUR TWITTER KEY';
const secret = 'YOUR TWITTER SECRET';
const moment = require('moment');
TweetsFetcher = {

  queryParamToURL: function(param) {
    let encodedParam = encodeURI(param.q);
    return [
      'https://api.twitter.com/1.1/search/tweets.json?q=',
      encodedParam,
      '&lang=en&result_type=recent&count=50'

    ].join('');
  },

  createCredentials: function(key, secret) {
    return new Buffer(key + ":" + secret).toString('base64');
  },

  getBearerToken: function(credentials, fetch) {
    let twitter_url = 'https://api.twitter.com/oauth2/token';
    let options =
      {
        url: twitter_url,
        method: 'POST',
        headers: {
          "Authorization": "Basic " + credentials,
          "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: "grant_type=client_credentials"
      }
    return fetch(options).then(
      function(data) {
        return data;
      }
    ).catch(function(err) {
      console.error("Error in fetch request: " + err.message);
      return err.message;
    });
  },

  fetchTweetsData: function(query, inputToken, fetch) {
    let token = inputToken;
    let url = TweetsFetcher.queryParamToURL(query);
    // Runtime token generation is disabled temprarily, uncomment this
    // after adding your twitter api key and secret at the top of script

    // if (!token) {
    //   let credentials = TweetsFetcher.createCredentials(key, secret);
    //   let rp = require('request-promise');
    //   token = TweetsFetcher.getBearerToken(credentials, rp);
    // }

    token = "AAAAAAAAAAAAAAAAAAAAAFxlgQAAAAAAsiNZMOUipZCfnikjV688HiCzYcI%3DskknzETemjQZmw5SrohvkYItwoqRN0ERHs3YvvulSJrQFtqyPI";

    let options = {
      "method": "GET",
      url: url,
      "headers": {
        "authorization": "Bearer " + token,
        "host":"api.twitter.com"
      }
    };
    return fetch(options).then(
      function(data) {
        return data;
      }
    ).catch(function(err) {
      console.error("Error in fetch request: " + err.message);
      return err.message;
    });
  },

  fetchTweets: function(query, token, fetch) {
    return TweetsFetcher.fetchTweetsData(query, token, fetch).then(function(data) {
      let parsedData = JSON.parse(data);
      return parsedData.statuses.map(TweetsFetcher.transformTwitterObject);
    });
  },

  transformTwitterObject: function(tweetObject) {
    return {
      created_at: TweetsFetcher.dateToMoment(tweetObject.created_at),
      text: tweetObject.text,
      user: tweetObject.user.name,
      screen_name: tweetObject.user.screen_name,
      profile_image_url:tweetObject.user.profile_image_url,
      profile_link: "https://twitter.com/"+ tweetObject.user.screen_name,
      tweet_link:"https://twitter.com/"+tweetObject.user.screen_name+"/status/"+tweetObject.id_str
    }
  },

  dateToMoment: function(stringDate) {
    return moment(Date.parse(stringDate)).fromNow();
  }
}

module.exports = TweetsFetcher;
