const router = require('express').Router();
const { User, Post, Vote, Comment} = require('../../models');

router.get('/', (req, res) => {
    User.findAll(
            { 
                attributes: {
                    exclude: ['password']
                },
            },
        
        )
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {
    User.findOne({
        attributes: { exclude: ["password"] },
        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'post_url', 'created_at']
            }, // which posts a user has created
            {
                model: Post,
                attributes: ['title'],
                trough: Vote,
                as: 'voted_posts'
            }, // which posts a user has voted on, which will come under the property name voted_posts, so that we know which set of data is which.
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['id', 'title', 'post_url', 'created_at']
                }
            }

        ],
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(404).json({message: 'No user found with this id.'})
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
});

// signup 
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

/* POST is the standard for login: 
In this case, a login route could've used the GET method 
since it doesn't actually create or insert anything into the database. 
But there is a reason why a POST is the standard for the login that's in process.
A GET method carries the request parameter appended in the URL string, 
whereas a POST method carries the request parameter in req.body, 
which makes it a more secure way of transferring data from the client to the server.
Remember, the password is still in plaintext, 
which makes this transmission process a vulnerable link in the chain.
*/
// login
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
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json({ user: dbUserData, message: 'You are now logged in!'});
        })


    })
})

// Logout/POST
router.post('/logout', (req,res) => {
    if (req.session.loggedIn) {
        // destory() method to clear the session
        req.session.destroy( () => {
            // we send back a 204 status code after the session has successfully been destroyed.
            res.status(204).end();
        })
    }
    else {
        res.status(404).end();
    }

});

router.put('/:id', (req, res) => {
    // This .update() method combines the parameters for creating data and looking up data. 
    // We pass in req.body to provide the new data we want to use in the update 
    // and req.params.id to indicate where exactly we want that new data to be used.
    User.update(
        req.body, // If req.body has exact key/value pairs to match the model, you can just use 'req.body' instead.
        {
            individualHooks: true,
            where: {
                id: req.params.id
            }
    })
    .then(dbUserData => {
        console.log(dbUserData)
        if (!dbUserData[0]) {
            res.status(404).json({message: 'No user found with this id'});
            return;
        }
        res.json(dbUserData);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json( {message: 'No user found with this id.'})
            return;
        }
        res.json(dbUserData);
    })
    .catch( err => {
        console.log(err);
        res.status(500).json(err)
    })
});

module.exports = router;