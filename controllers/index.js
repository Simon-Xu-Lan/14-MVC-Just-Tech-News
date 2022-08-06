const router = require('express').Router();
const homeRoutes = require('./home-routes.js');
const apiRoutes = require('./api');

router.use('/', homeRoutes);
router.use('/api', apiRoutes);

// this is to handle any endpoint that doesn't exist, 
//it senss a 404 error indicating the user requested an incorrect resource. 
// This is another RESTFUL API practice.
router.use((req, res) => {
    res.status(404).end();
})

module.exports = router;

// the index.js file is collecting the endpoints and prefixing them. 
// Here wer are collecting the packaged group of A{I endpoints and prefixing them with the path /api}
// The router instance in routes/index.js collected everything for us and packaged them up for server.js to use.

