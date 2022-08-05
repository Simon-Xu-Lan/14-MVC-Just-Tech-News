# MVC
## Model-View-Controller
MVC is an architectural pattern that structures a codebase as three distinct sections according to a software design philosophy known as separation of concerns.
modularizing your code to follow the Model-View-Controller (MVC) paradigm.

## Handlebars
Handlebars.js (Links to an external site.) is a logicless templating language that keeps the View and the code separate and compiles templates into JavaScript functions. It’s an extension to the Mustache templating language. Although there is a standard Handlebars npm package (Links to an external site.), you’ll use the Express Handlebars package (Links to an external site.) as the View engine for your Express.js applications.

## express-session package
The express-session package (Links to an external site.) is an Express.js middleware that uses sessions, a mechanism that helps applications to determine whether multiple requests came from the same client. Developers may assign every user a unique session so that their application can store the user state, and thus authenticate users.


## connect-session-sequelize package
The connect-session-sequelize package provides applications with a scalable store for sessions. The express-session package’s default server-side session storage, MemoryStore, is purposely not designed for a production environment, will leak memory under most conditions, doesn’t scale past a single process, and is only meant for debugging and developing. The connect-session-sequelize package resolves these issues and is compatible with the Sequelize ORM.