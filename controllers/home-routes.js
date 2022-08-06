// This file will contain all of the user-facing routes, such as the homepage and login page.

const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
 

router.get('/', (req, res) => {
  Post.findAll({
    attributes: [
      'id',
      'post_url',
      'title',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
        // serialize the entire array. This will loop over and map each Sequelize object into a serialized version of itself, saving the results in a new posts array.
        const posts = dbPostData.map( post => post.get({ plain: true }))
      // add the array to an object and continue passing an object to the template.
      res.render('homepage', { posts });  // note 1
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;

/*
Previously, we used res.send() or res.sendFile() for the response. 
Because we've hooked up a template engine, we can now use res.render() and specify which template we want to use. 
In this case, we want to render the homepage.handlebars template (the .handlebars extension is implied).
This template was light on content; it only included a single <div>. 
Handlebars.js will automatically feed that into the main.handlebars template, however, and respond with a complete HTML file.
*/

// Note 1: res.render('homepage', dbPostData[0].get({ plain: true })); 
// The data that Sequelize returns is actually a Sequelize object with a lot more information attached to it than you might have been expecting. To serialize the object down to only the properties you need, you can use Sequelize's get() method.
// You didn't need to serialize data before when you built API routes, because the res.json() method automatically does that for you.