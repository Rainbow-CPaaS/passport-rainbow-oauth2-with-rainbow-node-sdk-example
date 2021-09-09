var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , passport = require('passport')
  , util = require('util')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , MemoryStore = require('session-memory-store')(session)
  , RainbowStrategy = require('passport-rainbow-oauth2').Strategy;
const refresh = require('passport-oauth2-refresh');
const RainbowSDK = require("rainbow-node-sdk");

let rainbowMode =  "xmpp" ;

let urlCallback="http://127.0.0.1:3000";
let token_refresh = "";
let token_access = "";
let urlS2S = "";

(async function() {
  console.log("MAIN - start.");

  // the URL urlCallback + "/auth/rainbow/callback" as to be setted in rainbow application oauth setting on the hub.openrainbow.com.
  //urlCallback = "http://82.65.146.201:3000"
  urlCallback = "http://XXX.XXX.XXX.XXX:3000"

  console.log("MAIN - urlCallback : ", urlCallback);


  // Define your configuration
  let options = {
    "rainbow": {
      "host": "sandbox",                      // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
      //      "host": "openrainbow.net",
      // "mode": "s2s"
      "mode": rainbowMode,
      //"mode": "xmpp"
      // "concurrentRequests" : 20
    },
    "xmpp": {
      "host": "",
      "port": "443",
      "protocol": "wss",
      "timeBetweenXmppRequests": "20"
    },
    "s2s": {
      "hostCallback": urlS2S,
      //"hostCallback": "http://70a0ee9d.ngrok.io",
      "locallistenningport": "4000"
    },
    "credentials": {
      "login": "",  // The Rainbow email account to use
      "password": "",
    },
    // Application identifier
    "application": {
      "appID": "",
      "appSecret": ""

    },
    // */

    // Proxy configuration
    proxy: {
      host: undefined,
      port: 8080,
      protocol: undefined,
      user: undefined,
      password: undefined,
      secureProtocol: undefined //"SSLv3_method"
    }, // */
    // Proxy configuration

    /*
    proxy: {
        host: "10.67.253.14",
        port: 8081,
        protocol: "http",
       // user: "",
        //password: "",
        //secureProtocol: "SSLv3_method"
    }, // */
    // Logs options
    "logs": {
      "enableConsoleLogs": true,
      "enableFileLogs": false,
      "enableEventsLogs": false,
      "color": true,
      //"level": "info",
      "level": "debug",
      "customLabel": "RainbowSample",
      "system-dev": {
        "internals": true,
        "http": true,
      },
      "file": {
        "path": "c:/temp/",
        "customFileName": "R-SDK-Node-Sample",
        //"level": 'info',                    // Default log level used
        "zippedArchive": false /*,
            "maxSize" : '10m',
            "maxFiles" : 10 // */
      }
    },
    "testOutdatedVersion": true,
    "intervalBetweenCleanMemoryCache": 1000 * 60 * 60 * 6, // Every 6 hours.
    "requestsRate":{
      "maxReqByIntervalForRequestRate": 600, // nb requests during the interval.
      "intervalForRequestRate": 60, // nb of seconds used for the calcul of the rate limit.
      "timeoutRequestForRequestRate": 600 // nb seconds Request stay in queue before being rejected if queue is full.
    },
    // IM options
    "im": {
      "sendReadReceipt": true,
      "messageMaxLength": 1024,
      "sendMessageToConnectedUser": true,
      "conversationsRetrievedFormat": "small",
      "storeMessages": false,
      "copyMessage": true,
      "nbMaxConversations": 15,
      "rateLimitPerHour": 100000,
//        "messagesDataStore": DataStoreType.NoStore,
      "messagesDataStore": "storetwinside",
      "autoInitialBubblePresence": true,
      "autoLoadConversations": true,
      // "autoInitialBubblePresence": false,
      // "autoLoadConversations": false,
      "autoLoadContacts": true
    },
    // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.
    // Take care, severals services are linked, so disabling a service can disturb an other one.
    // By default all the services are started. Events received from server are not yet filtered.
    // So this feature is realy risky, and should be used with much more cautions.
    "servicesToStart": {
      "bubbles": {
        "start_up": true,
      },
      "telephony": {
        "start_up": true,
      },
      "channels": {
        "start_up": true,
      },
      "admin": {
        "start_up": true,
      },
      "fileServer": {
        "start_up": true,
      },
      "fileStorage": {
        "start_up": true,
      },
      "calllog": {
        "start_up": true,
      },
      "favorites": {
        "start_up": true,
      },
      "alerts": {
        "start_up": true,
      }, //need services :
      "webrtc": {
        "start_up": true,
        "optional": true
      } // */
    } // */
  };

  let RAINBOW_APP_ID      = "";
  let RAINBOW_APP_SECRET  = "";

  process.argv.forEach((val, index) => {
    //console.log(`${index}: ${val}`);
    if (`${val}`.startsWith("login=") ) {
      options.credentials.login = `${val}`.substring(6);
    }
    if (`${val}`.startsWith("password=") ) {
      options.credentials.password = `${val}`.substring(9);
    }
    if (`${val}`.startsWith("host=") ) {
      options.rainbow.host = `${val}`.substring(5);
    }
    if (`${val}`.startsWith("appID=") ) {
      //options.application.appID = `${val}`.substring(6);
      RAINBOW_APP_ID = `${val}`.substring(6);
    }
    if (`${val}`.startsWith("appSecret=") ) {
      //options.application.appSecret = `${val}`.substring(10);
      RAINBOW_APP_SECRET = `${val}`.substring(10);
    }
  });


  options.logs.customLabel = options.credentials.login;


  options.logs.customLabel = options.credentials.login;
// Instantiate the SDK
  let rainbowSDK = new RainbowSDK(options);

  let logger = rainbowSDK._core.logger;

// API Access link for creating client ID and secret:
// https://hub.openrainbow.com/#/dashboard/applications

  rainbowSDK.events.on("rainbow_onready", () => {
    // do something when the SDK is ready to be used
    logger.log("debug", "MAIN - (rainbow_onready) - rainbow onready");
    logger.log("debug", "MAIN - ----------------------------------------------------");
  });

  rainbowSDK.events.on("rainbow_onstarted", () => {
    // do something when the SDK has been started
    logger.log("debug", "MAIN - (rainbow_onstarted) - rainbow onstarted");
  });
  
  rainbowSDK.events.on("rainbow_onusertokenrenewfailed", () => {
    // do something when the SDK has been rainbow_onusertokenrenewfailed
    logger.log("debug", "MAIN - (rainbow_onusertokenrenewfailed) - rainbow");
    refresh.requestNewAccessToken(
        'rainbow',
        token_refresh,
        async function (err, accessToken, refreshToken) {
          // You have a new access token, store it in the user object,
          // or use it to make a new request.
          // `refreshToken` may or may not exist, depending on the strategy you are using.
          // You probably don't need it anyway, as according to the OAuth 2.0 spec,
          // it should be the same as the initial refresh token.
          console.log("(rainbow_onusertokenrenewfailed) requestNewAccessToken err : ", err);
          console.log("(rainbow_onusertokenrenewfailed) requestNewAccessToken accessToken : ", accessToken);
          console.log("(rainbow_onusertokenrenewfailed) requestNewAccessToken refreshToken : ", refreshToken);
          token_refresh = refreshToken;

          await rainbowSDK.setRenewedToken(accessToken);
        },
    );
  });
  
  rainbowSDK.events.on("rainbow_onusertokenwillexpire", () => {
    // do something when the SDK has been rainbow_onusertokenwillexpire
    logger.log("debug", "MAIN - (rainbow_onusertokenwillexpire) - rainbow");
    refresh.requestNewAccessToken(
        'rainbow',
        token_refresh,
        async function (err, accessToken, refreshToken) {
          // You have a new access token, store it in the user object,
          // or use it to make a new request.
          // `refreshToken` may or may not exist, depending on the strategy you are using.
          // You probably don't need it anyway, as according to the OAuth 2.0 spec,
          // it should be the same as the initial refresh token.
          console.log("(rainbow_onusertokenwillexpire) requestNewAccessToken err : ", err);
          console.log("(rainbow_onusertokenwillexpire) requestNewAccessToken accessToken : ", accessToken);
          console.log("(rainbow_onusertokenwillexpire) requestNewAccessToken refreshToken : ", refreshToken);
          token_refresh = refreshToken;

          await rainbowSDK.setRenewedToken(accessToken);
        },
    );
  });
  
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Rainbow profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the RainbowStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Rainbow
//   profile), and invoke a callback with a user object.
  let strat= new RainbowStrategy({
    rainbowDomain: options.rainbow.host,
    clientID: RAINBOW_APP_ID,
    clientSecret: RAINBOW_APP_SECRET,
//  callbackURL: "http://127.0.0.1:3000/auth/rainbow/callback",
    callbackURL: urlCallback + "/auth/rainbow/callback",
    passReqToCallback: true
  }, function (request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(async function () {
      token_access = accessToken
      token_refresh = refreshToken;
      // To keep the example simple, the user's Rainbow profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Rainbow account with a user record in your database,
      // and return that user instead.
      //if (!err) {
        await rainbowSDK.start(token_access);
      //}
      return done(null, profile);
    });
  }
);
  
passport.use(strat);
refresh.use(strat);

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'cookie_secret',
  name: 'kaas',
  store: new MemoryStore({}),
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

app.get('/me', ensureAuthenticated, function (req, res) {
  let result = strat.getMe(req.user);
  res.render('result', { "result": req.result });
});

app.get('/Contact', forceAuthenticated, async function (req, res) {
  try {
    let result = await rainbowSDK.contacts.getContactByLoginEmail("vincent01@vbe.test.openrainbow.net", true); //strat.getMe(req.user);
    /*let result = {
      _lastContactCacheUpdate: "2021-09-08T09:14:04.334Z",
        id: '5c1a3df51490a30213b9d9e2',
        _displayName: 'Vincent01 Berder01',
        name: { value: 'Vincent01 Berder01' },
    displayNameMD5: '71b4362c509116810bef3204e4ce08df',
        companyName: 'westworld.com',
        loginEmail: 'vincent01@vbe.test.openrainbow.net',
        nickName: '',
        title: '',
        jobTitle: '',
        country: 'FRA',
        timezone: 'Europe/Paris',
        organisationId: undefined,
        siteId: undefined,
        companyId: '5c3df744ddccdd341a960ba9',
        jid_im: '98091bcde14d4eadac763d9cc0851719@openrainbow.net',
        jid: '98091bcde14d4eadac763d9cc0851719@openrainbow.net',
        jid_tel: 'tel_98091bcde14d4eadac763d9cc0851719@openrainbow.net',
        jidtel: 'tel_98091bcde14d4eadac763d9cc0851719@openrainbow.net',
        avatar: 'https://cdn.openrainbow.net:443/api/avatar/5c1a3df51490a30213b9d9e2?update=6e36c569e8cb22f1a9be18eb88bbf042',
        lastAvatarUpdateDate: '2018-12-19T12:48:43.417Z',
        lastUpdateDate: 'Z'}
        
     // */
    if (result) {
      res.render('ContactInfo', {"ContactInfo": result});
    }
    else {
      res.render('ContactInfoNotFound', {});
    }
  } catch (err) {
    console.log("err : ", err);
    res.render('ContactInfoNotFound', {});
  }
});

app.get('/reftoken', ensureAuthenticated, function (req, res) {
  refresh.requestNewAccessToken(
      'rainbow',
      token_refresh,
      async function (err, accessToken, refreshToken) {
        // You have a new access token, store it in the user object,
        // or use it to make a new request.
        // `refreshToken` may or may not exist, depending on the strategy you are using.
        // You probably don't need it anyway, as according to the OAuth 2.0 spec,
        // it should be the same as the initial refresh token.
        console.log("requestNewAccessToken err : ", err);
        console.log("requestNewAccessToken accessToken : ", accessToken);
        console.log("requestNewAccessToken refreshToken : ", refreshToken);
        token_refresh = refreshToken;

        await rainbowSDK.setRenewedToken(accessToken);
        
        res.render('result', { "accessToken": accessToken, "refreshToken": refreshToken });
      },
  );
  /*
  let result = strat.getRefreshedToken(req.user, strat.tokenURL);
  res.render('result', { "result": req.result });
  // */
});

app.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

// GET /auth/rainbow
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Rainbow authentication will involve
//   redirecting the user to openrainbow.com.  After authorization, Rainbow
//   will redirect the user back to this application at /auth/rainbow/callback
app.get('/auth/rainbow', passport.authenticate('rainbow', {
  scope: ['all']
}));

// GET /auth/rainbow/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/rainbow/callback',
  passport.authenticate('rainbow', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

server.listen(3000);




// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

function forceAuthenticated(req, res, next) {
   return next(); 
}

})();
