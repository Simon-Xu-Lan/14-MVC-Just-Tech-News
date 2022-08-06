const router = require('express').Router();
const { Post, User, Vote, Comment } = require('../../models');
const sequelize = require('../../config/connection');

/* Why did we include the User model for the post-routes?

In a query to the post table, 
we would like to retrieve not only information about each post, 
but also the user that posted it. With the foreign key, user_id, 
we can form a JOIN, an essential characteristic of the relational data model.
*/

/* Why do we get created_at and username columns in this query since they are not in the Post model?
The created_at column is auto-generated at the time a post is 
created with the current date and time, thanks to Sequelize. 
We do not need to specify this column or the updated_at column in the model definition, 
because Sequelize will timestamp these fields by default 
unless we configure Sequelize not to.
*/


router.get('/', (req, res) => {
    console.log('=================');
    Post.findAll({
        attributes: [
            'id', 
            'post_url', 
            'title', 
            'created_at',
            [
                sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.id)'),
                'vote_count'
            ]
        ],
        // Remember back in the Post model, we defined the column names to 
        // have an underscore naming convention by using the underscored: true, assignment. 
        // In Sequelize, columns are camelcase by default.

        order:[['created_at', 'DESC']],

        // In the next step, we'll include the JOIN to the User table. 
        // We do this by adding the property include, 
        include: [
            {
                model: User,
                attributes: ['username']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            }
        ]
        // Notice that the include property is expressed as an array of objects. 
        // To define this object, we need a reference to the model and attributes. 
        // Can you imagine a circumstance where more than one table JOIN would be necessary?
    })
    // create a Promise that captures the response from the database call
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// Get a single post
router.get('/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: [
            'id', 
            'post_url', 
            'title', 
            'created_at',
            [
                sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
                'vote_count'
            ]
        ],
        include: [
            {
                model: User,
                attributes: ['username']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            }
        ]
    })
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(400).json({message: 'No post found with this id'});
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// Creaet a single Post
router.post('/', (req, res) => {
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })

})

// Create PUT route for voting on a post
// When we vote on a post, we're technically updating that post's data. This means that we should create a PUT route for updating a post.
// Make sure this PUT route is defined before the /:id PUT route, though. Otherwise, Express.js will think the word "upvote" is a valid parameter for /:id.
// An upvote request will differ somewhat from the PUT requests we've created before. It will involve two queries: first, using the Vote model to create a vote, then querying on that post to get an updated vote count.
// ##  Just remember, because we've updated the relationships between the tables, we need to use sequelize.sync({ force: true }) in server.js to drop the tables and recreate them!
//  - Like earlier, once you turn on the server with sequelize.sync({ force: true }) and confirm the database tables were recreated, switch back to using { force: false } and restart the server one more time just to make sure the changes took hold and you don't accidentally remove data!
router.put('/upvote', (req, res) => {
    // customer static method  created in models/Post.js
    Post.upvote(req.body, { Vote })
        .then(updatedPostData => res.json(updatedPostData))
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    // See how much cleaner this looks now? By creating all of that complicated code at the model level, now we have a much more readable method to use in the route.

    // Vote.create({
    //     user_id: req.body.user_id,
    //     post_id: req.body.post_id
    // })
    // .then( () => {
    //     // then find the post we just voted on
    //     return Post.findOne({
    //         where: {
    //             id: req.body.post_id
    //         },
    //         attributes: [
    //             'id',
    //             'post_url',
    //             'title',
    //             'created_at',
    //             // use raw MySQL aggregate function query to get a count of how many votes the post has and return it under the name 'vote_count'
    //             // We'll have to call on special Sequelize functionality to use this.
    //             // Under some circumstances, built-in Sequelize methods can do just that—specifically one called .findAndCountAll(). Unfortunately, because we're counting an associated table's data and not the post itself, that method won't work here.
    //             // Instead of trying to predict and build a method for every possible use developers have for SQL databases, Sequelize provides us with a special method called .literal() that allows us to run regular SQL queries from within the Sequelize method-based queries.
    //             // So when we vote on a post, we'll see that post—and its updated vote total—in the response.

    //             [
    //                 sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
    //                 'vote_count' // return it under the name `vote_count`
    //             ]
    //         ]
    //     })
    // })
    // .then(dbPostData => res.json(dbPostData))
    // .catch(err => {
    //     console.log(err)
    //     res.status(400).json(err)
    // });

})

// Update a post's title
router.put('/:id', (req, res) => {
    Post.update(
        {
            title: req.body.title
        },
        {
            where: { id: req.params.id }
        }
    )
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})

// Delete a post
router.delete('/:id', (req, res) => {
    Post.destroy(
        { 
            where: { id: req.params.id}
        }
    )
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({message: 'No post found with this id'});
            return
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    })
})


module.exports = router;
// Keep this expression at the bottom of the file 
// since we will want to assign the router once Express API endpoints have been defined.