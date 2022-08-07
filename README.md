# MVC
## Model-View-Controller
MVC is an architectural pattern that structures a codebase as three distinct sections according to a software design philosophy known as separation of concerns.
modularizing your code to follow the Model-View-Controller (MVC) paradigm.

MVC is a popular software-design pattern that organizes your app into the three following separate concerns:
- Models: the core data of your app
    - Just Tech News already has Models via the Sequelize ORM. 
- Views: the UI components, such as your HTML layouts
    - represented by Handlebar templates
- Controllers: the link between your models and views
    - Express.js routes take requests, communicate with the Models, and will eventually respond with a View.

## MVC folder structure
- controllers/
    - home-routes.js  ----> This file will contain all of the user-facing routes, such as the homepage and login page.

        


## Handlebars
Handlebars.js (Links to an external site.) is a logicless templating language that keeps the View and the code separate and compiles templates into JavaScript functions. It’s an extension to the Mustache templating language. Although there is a standard Handlebars npm package (Links to an external site.), you’ll use the Express Handlebars package (Links to an external site.) as the View engine for your Express.js applications.

The main.handlebars file used three curly brackets as {{{ body }}}, but here we're only using two brackets as {{ title }}. Why is that? The difference is that two brackets will convert HTML characters to strings. For instance, < would become &lt;. Three brackets, on the other hand, will render the data as HTML.
For more information, review the Handlebars.js docs on HTML escaping (For more information, review the [Handlebars.js docs on HTML escaping](https://handlebarsjs.com/guide/#html-escaping).


## express-session package
The express-session package (Links to an external site.) is an Express.js middleware that uses sessions, a mechanism that helps applications to determine whether multiple requests came from the same client. Developers may assign every user a unique session so that their application can store the user state, and thus authenticate users.


## connect-session-sequelize package
The connect-session-sequelize package provides applications with a scalable store for sessions. The express-session package’s default server-side session storage, MemoryStore, is purposely not designed for a production environment, will leak memory under most conditions, doesn’t scale past a single process, and is only meant for debugging and developing. The connect-session-sequelize package resolves these issues and is compatible with the Sequelize ORM.

## Async/await
Async/await acts as "syntactic sugar" for our code, much like ES6 classes, and help make our Promises more readable.
To help asynchronous code use async/await, we first add the keyword async to the function that wraps our asynchronous code.

# Session
Sessions allow our Express.js server to keep track of which user is making a request, and store useful data about them in memory.
 
store information about the session on the user's client
- We can do so by using HTTP cookies, commonly referred to as simply cookies.

### Cookies
HTTP cookies, commonly referred to as simply cookies.

there are vulnerabilities that allow cookies to be accessed by third parties.
This why we do not store sensitive information like passwords in cookies.
 If you'd like to learn more, visit Wikipedia's page on [HTTP Cookies](https://en.wikipedia.org/wiki/HTTP_cookie).

We'll store the user's cookies in the database as well so that we can easily re-create the user's session, even if our server is offline for any reason.

### express-session 
The express-session library allows us to connect to the back end.
### connect-session-sequelize
The connect-session-sequelize library automatically stores the sessions created by express-session into our database.

### Session setup at server.js
- This code sets up an Express.js session and connects the session to our Sequelize database.

```js
const session = require('express-session');

const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
  secret: 'Super secret secret',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

app.use(session(sess));

```
- secret: "Super secret secret"
    - "Super secret secret" should be replaced by an actual secret and stored in the .env file. 
- cookie: {}
    - to tell our session to use cookies is to set cookie to be {}. 
    - If we wanted to set additional options on the cookie, like a maximum age, we would add the options to that object.
    - [Express.js session cookie documentation](https://github.com/expressjs/session#cookie)

### Session at controllers/api/user-routes.js
#### signup/POST
- accessing the session information in the routes is very straightforward.
- This gives our server easy access to the user's user_id, username, and a Boolean describing whether or not the user is logged in.
- **IMPORTANT**: 
    - We want to make sure the session is created before we send the response back, so we're wrapping the variables in a callback. 
    - The req.session.save() method will initiate the creation of the session and then run the callback function once complete.
```js
router.post('/', (req, res) => {
    console.log(req.body)
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    .then(dbUserData => {
        req.session.save( () => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
            
            res.json(dbUserData)
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});
```

#### login/POST

```js
router.post('/login', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then( dbUserData => {
        if (!dbUserData) {
            res.status(400).json({message: 'No user with that email address!'});
            return;
        }
        
        // verify user
        const validPassword = dbUserData.checkPassword(req.body.password);
        if(!validPassword) {
            res.status(400).json( {message: 'Incorrect password!'})
            return;
        }

        req.session.save( () => {
            // declare session variables
            req.session.user_id = dbUserDataid;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json({ user: dbUserData, message: 'You are now logged in!'});
        })


    })
})

```
### Logout
- destroy the session and reset the cookie

#### location.replace()
- The replace() method replaces the current document with a new one.
- replace() removes the current URL from the document history.
- With replace() it is not possible to use "back" to navigate back to the original document.
- The replace() method of the Location interface replaces the current resource with the one at the provided URL. The difference from the assign() method is that after using replace() the current page will not be saved in session History, meaning the user won't be able to use the back button to navigate to it.