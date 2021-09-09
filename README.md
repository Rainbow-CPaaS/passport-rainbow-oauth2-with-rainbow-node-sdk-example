# Passport strategy for Rainbow OAuth 2.0

[Passport](http://passportjs.org/) strategies for authenticating with [Rainbow](http://www.openrainbow.com/)
using ONLY OAuth 2.0.

This module lets you authenticate using Rainbow in your Node.js applications.

And use the rainbow-node-sdk in it.

## Install

    go to the sources and do
    $ npm install

## Usage of OAuth 2.0

#### Configure Strategy

The Rainbow OAuth 2.0 authentication strategy authenticates users using a Rainbow
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.
The `rainbowDomain` strategy allows  to specify an alternative Rainbow platform (i.e. : sandbox.openrainbow.com )

You can start the example with command line :
node app.js host=openrainbow.com appID=235ac...6d3 appSecret=co3...pDc
Where:
 * host is the rainbowDomain
 * appID is the RAINBOW_APP_ID
 * appSecret is the RAINBOW_APP_SECRET

note that the urlCallback + "/auth/rainbow/callback" has to be setted in Rainbow API Access Application link for creating client ID and secret:
https://hub.openrainbow.com/#/dashboard/applications

```Javascript
  urlCallback = "http://XXX.XXX.XXX.XXX:3000"

let RainbowStrategy = require( 'passport-rainbow-oauth2' ).Strategy;

passport.use(new RainbowStrategy({
    clientID:     RAINBOW_APP_ID,
    clientSecret: RAINBOW_APP_SECRET,
    callbackURL: urlCallback + "/auth/rainbow/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ rainbowId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Use case

You will be able to login with the URL "urlCallback"
And you will be able to use a call to the SDK with "urlCallback"/Contact 


## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2019 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
