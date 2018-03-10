const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const compression = require("compression");
const session = require("express-session");
const passport = require("passport");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const PORT = process.env.PORT || 8080;
const app = express();
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
module.exports = app;

if (process.env.NODE_ENV !== "production") require("../secrets");

// passport registration
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  db.models.user
    .findById(id)
    .then(user => done(null, user))
    .catch(done)
);

const createApp = () => {
  // logging middleware
  app.use(morgan("dev"));

  // body parsing middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // compression middleware
  app.use(compression());

  // session middleware with passport
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "my best friend is Cody",
      // store: sessionStore,
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  // app.use(passport.session())

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use(cookieParser());

  //  api routes
  app
    .use("/api", require("./api"))

    // any remaining requests with an extension (.js, .css, etc.) send 404
    .use((req, res, next) => {
      if (path.extname(req.path).length) {
        const err = new Error("Not found");
        err.status = 404;
        next(err);
      } else {
        next();
      }
    });

  // sends index.html
  app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public/index.html"));
  });

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || "Internal server error.");
  });
};

const startListening = () => {
  const server = app.listen(PORT, () =>
    console.log(`Mixing it up on port ${PORT}`)
  );
};

if (require.main === module) {
  createApp();
  startListening();
} else {
  createApp();
}
