const router = require('express').Router();

const userRoutes = require('./user-routes');
const postRoutes = require('./post-routes');
const commentRoutes = require('./comment-routes');

router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes); // all of the routes defined in comment-routes.js will have a /comments prefix.

module.exports = router;

// the purpose of index.js
// While this is a small file, we're keeping the API endpoints nice and organized 
// allowing the API to be scalable.
// we'll add more API endpoints and use this file to collect them and give them their prefixed name.
// Prefixing routes wiht the path "/users"