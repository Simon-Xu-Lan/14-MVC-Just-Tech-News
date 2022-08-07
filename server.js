const path = require('path');
const express = require('express');
const routes = require('./controllers/');
const sequelize = require('./config/connection');
const exphbs = require('express-handlebars');

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
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(session(sess));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// The express.static() method is a built-in Express.js middleware function that can take all of the contents of a folder and serve them as static assets. 
// This is useful for front-end specific files like images, style sheets, and JavaScript files.
app.use(express.static(path.join(__dirname, 'public')));
// turn on routes
app.use(routes);


const hbs = exphbs.create({});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars')

// turn on connection to db and server
sequelize.sync(
    { force: false}
)
.then( () => {
    app.listen(PORT, () => {
        console.log('Now listening')
    });
});


/* at the bottom of the file, we use the sequelize.sync() method 
to establish the connection to the database. 
The "sync" part means that this is Sequelize taking the models 
and connecting them to associated database tables. 
If it doesn't find a table, it'll create it for you! */
/* 
- {force: false} in the .sync() method:
    - This doesn't have to be included, 
    - but if it were set to true, 
        - it would drop and re-create all of the database tables on startup.
    - This is great for when we make changes to the Sequelize models, 
*/
