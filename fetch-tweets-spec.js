'use strict';

let expect = require('chai').expect;

describe('TweetsFetcher', function() {
  let TweetsFetcher = require('./fetch-tweets.js');
  it('should exist', function() {
    expect(TweetsFetcher).to.not.be.undefined;
  });

  describe('#queryParamToURL()', function() {
    it('should take a query string and return a url string', function() {
      let query = {q: 'game of thrones'};
      let expected = 'https://api.twitter.com/1.1/search/tweets.json?q=game%20of%20thrones&lang=en&result_type=recent&count=50'
      let actual = TweetsFetcher.queryParamToURL(query);
      expect(actual).to.equal(expected);
    });
  });

  describe("#createCredentials()", function() {
    it("should create base64 credentials for oauth using key and secret", function() {
        let key="some random key";
        let secret = "some random secret";
        let expected = "c29tZSByYW5kb20ga2V5OnNvbWUgcmFuZG9tIHNlY3JldA=="
        let actual = TweetsFetcher.createCredentials(key,secret);
        expect(actual).to.equal(expected);
    });
  });

  describe("#getBearerToken()", function() {
    it("should generate a bearer token using secret credentials", function() {
      let credentials = "abc123";
      let fakeBearerToken = {
        "token_type":"bearer",
        "access_token":"abcd123"
      }
      let fakeFetcher = function(options) {
        let expectedOptions = {
          url: 'https://api.twitter.com/oauth2/token',
          method: 'POST',
          headers: {
            "Authorization": "Basic " + "abc123",
            "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: "grant_type=client_credentials"
        };
        expect(options).to.eql(expectedOptions);
        return Promise.resolve(fakeBearerToken);
      };

      return TweetsFetcher.getBearerToken(credentials, fakeFetcher).then(function(actual) {
        expect(actual).to.eql(fakeBearerToken);
      });
    });
  });

  describe("#fetchTweetsData()", function() {
    it("should take a url with query param,token and fetcher function and return tweets for that query", function() {
      let fakeData = [{
        created_at: "Mon Sep 24 03:35:21 +0000 2012",
        text: "loved this week GOT episode",
        user: "saurabh0908",
        screen_name: "saurabh0908",
        profile_image_url:"http://proxyimage/saurabh0908",
        profile_link: "https://twitter.com/saurabh0908",
        tweet_link:"https://twitter.com/saurabh0908/status/123456"
      },
      {
        created_at: "Mon Sep 24 03:35:21 +0000 2012",
        text: "it was boring to watch GOT",
        user: "random123",
        screen_name: "random123",
        profile_image_url:"http://proxyimage/random123",
        profile_link: "https://twitter.com/random123",
        tweet_link:"https://twitter.com/random123/status/123"
      }];
      let query = 'game of thrones',
          token = 'abcd123',
          fakeFetcher = function(query, token) {
            return Promise.resolve(fakeData);
          };
      return TweetsFetcher.fetchTweetsData(query, token, fakeFetcher).then(function(actual) {
        expect(actual).to.eql(fakeData);
      })
    })
  });

  describe("#fetchTweets()", function() {
    it("should take a url with query param,token and fetcher function and return the promise for transformed photos", function() {
      let fakeData = {
        "statuses": [
          {
          "coordinates": null,
          "favorited": false,
          "created_at": "Mon Sep 24 03:35:21 +0000 2012",
          "id_str": "250075927172759552",
          "text": "loved this week GOT episode",
          "user": {
              "profile_background_tile": false,
              "name": "Saurabh Shrivastava",
              "screen_name": "saurabh0908",
              "profile_image_url": "http://a0.twimg.com/profile_images/2359746665/1v6zfgqo8g0d3mk7ii5s_normal.jpeg",
              "location": "LA, CA"
            }
          },
          {
            "coordinates": null,
            "favorited": false,
            "created_at": "Mon Sep 25 03:35:21 +0000 2012",
            "id_str": "250075927172759123",
            "text": "boring GOT episode",
            "user": {
              "profile_background_tile": false,
              "name": "Shuchi Muley ",
              "screen_name": "shuchimuley",
              "profile_image_url": "http://a0.twimg.com/profile_images/2359746231/1v6zfgqo8g0d3mk7asdf_normal.jpeg",
              "location": "SF, CA"
            }
          }
        ],
        "search_metadata": {
          "max_id": 250126199840518140,
          "since_id": 24012619984051000,
          "count": 4
        }
      };

      let expected = [
        {
          created_at: "5 years ago",
          text: "loved this week GOT episode",
          user: "Saurabh Shrivastava",
          screen_name: "saurabh0908",
          profile_image_url:"http://a0.twimg.com/profile_images/2359746665/1v6zfgqo8g0d3mk7ii5s_normal.jpeg",
          profile_link: "https://twitter.com/saurabh0908",
          tweet_link:"https://twitter.com/saurabh0908/status/250075927172759552"
        },
        {
          created_at: "5 years ago",
          text: "boring GOT episode",
          user: "Shuchi Muley ",
          screen_name: "shuchimuley",
          profile_image_url:"http://a0.twimg.com/profile_images/2359746231/1v6zfgqo8g0d3mk7asdf_normal.jpeg",
          profile_link: "https://twitter.com/shuchimuley",
          tweet_link:"https://twitter.com/shuchimuley/status/250075927172759123"
        }
      ];

      let query = 'game of thrones',
          token = 'abcd123',
          fakeFetcher = function(query, token) {
            return Promise.resolve(JSON.stringify(fakeData));
          };
      return TweetsFetcher.fetchTweets(query,token, fakeFetcher).then(function(actual) {
        expect(actual).to.eql(expected);
      }) ;
    })

  });

  describe("#transformTwitterObject()", function() {
    it('should take a twitter object and return just the relevant fields', function() {
      let input = {
        "coordinates": null,
        "favorited": false,
        "created_at": "Mon Sep 24 03:35:21 +0000 2012",
        "id_str": "250075927172759552",
        "text": "loved this week GOT episode",
        "user": {
          "profile_background_tile": false,
          "name": "Saurabh Shrivastava",
          "screen_name": "saurabh0908",
          "profile_image_url": "http://a0.twimg.com/profile_images/2359746665/1v6zfgqo8g0d3mk7ii5s_normal.jpeg",
          "location": "LA, CA"
        }
      };

      let expected = {
        created_at: "5 years ago",
        text: "loved this week GOT episode",
        user: "Saurabh Shrivastava",
        screen_name: "saurabh0908",
        profile_image_url:"http://a0.twimg.com/profile_images/2359746665/1v6zfgqo8g0d3mk7ii5s_normal.jpeg",
        profile_link: "https://twitter.com/saurabh0908",
        tweet_link:"https://twitter.com/saurabh0908/status/250075927172759552"
      };

      let actual = TweetsFetcher.transformTwitterObject(input);
      expect(actual).to.eql(expected);

    })
  });
  describe("#dateToMoment()", function() {
    it("should return moment formatted date of input date", function() {
      let input = "Mon Sep 24 03:35:21 +0000 2012",
      expected = "5 years ago";
      expect(TweetsFetcher.dateToMoment(input)).to.equal(expected);
    })
  })
});
