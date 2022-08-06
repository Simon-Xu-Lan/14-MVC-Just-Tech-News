const User = require('./User');
const Post = require('./Post');
const Vote = require('./Vote');
const Comment = require('./Comment')

// create associations / relationships

// ==== one to many ===
// => One owes many. One is the owner
// => Many belongs to one. many is owned by oen
// In one-to-many relationships like this, the owned data entity (i.e., the post that a user creates) holds a reference to its owner. The owner holds no reference to the data it owns, to prevent unnecessary duplication.

// one user to create many posts, with each post belonging to a single user
/*
A user can make many posts. 
But a post only belongs to a single user, and never many users.
one-to-many relationship.
*/
// This association creates the reference for the id column in the User model to link to the corresponding foreign key pair, 
// which is the user_id in the Post model.
User.hasMany(Post, {
    foreignKey: 'user_id'
})
// We also need to make the reverse association by adding the following statement to the index.js file:
// In this statement, we are defining the relationship of the Post model to the User. 
// The constraint we impose here is that a post can belong to one user, but not many users.
//  Again, we declare the link to the foreign key, which is designated at user_id in the Post model.
Post.belongsTo(User, {
    foreignKey: 'user_id'
})


// ==== Many to Many ====
// In this relationship, each side must hold a reference to its counterpart
// Through table: So we need to create a third table, for the sole purpose of connecting the data between two other tables with their primary keys. This is known as a through table.

// With these two .belongsToMany() methods in place, we're allowing both the User and Post models to query each other's information in the context of a vote. 
// If we want to see which users voted on a single post, we can now do that. 
// If we want to see which posts a single user voted on, we can see that too.
// We instruct the application that the User and Post models will be connected, but in this case through the Vote model.

// Furthermore, the Vote table needs a row of data to be a unique pairing so that it knows which data to pull in when queried on. So because the user_id and post_id pairings must be unique, we're protected from the possibility of a single user voting on one post multiple times.
// This layer of protection is called a foreign key constraint.

User.belongsToMany(Post, {
    through: Vote,
    as: 'voted_posts', // We also stipulate that the name of the Vote model should be displayed as voted_posts when queried on, making it a little more informative.
    foreignKey: 'user_id'
});

Post.belongsToMany(User, {
    through: Vote,
    as: 'voted_posts', // We also stipulate that the name of the Vote model should be displayed as voted_posts when queried on, making it a little more informative.
    foreignKey: 'post_id'
})

// but even though we're connecting the Post and User models together through the Vote model, there actually is no direct relationship between Post and Vote or User and Vote. 
// If we want to see the total number of votes on a post, we need to directly connect the Post and Vote models.
// By also creating one-to-many associations directly between these models, we can perform aggregated SQL functions between models
// In this case, we'll see a total count of votes for a single post when queried. This would be difficult if we hadn't directly associated the Vote model with the other two.


Vote.belongsTo(User, {
    foreignKey: 'user_id'
});
Vote.belongsTo(Post, {
    foreignKey: 'post_id'
});
User.hasMany(Vote, {
    foreignKey: 'user_id'
});
Post.hasMany(Vote, {
    foreignKey: 'post_id'
})

Comment.belongsTo(User, {
    foreignKey: 'user_id'
});

Comment.belongsTo(Post, {
    foreignKey: 'post_id'
})

User.hasMany(Comment, {
    foreignKey: 'user_id'
});

Post.hasMany(Comment, {
    foreignKey: 'post_id'
});

// Define Comment relationship with User , Post.
// User to Comment: One to Many relationship
Comment.belongsTo(User, {
    foreignKey: 'user_id'
});
User.hasMany(Comment, {
    foreignKey: 'user_id'
});

// Post to comment: One to Many relationship
Comment.belongsTo(Post, {
    foreignKey: 'post_id'
});
Post.hasMany(Comment, {
    foreignKey: 'post_id'
});

module.exports = { User, Post, Vote, Comment };

/*
Do we have to do the same drop/create process to the tables 
because we created the associations on the application layer this time?

Yes, we do. These association changes will not take affect in the User table, 
because there isn't a way to make changes to the table dynamically. 
We will need to drop the table and create a new one 
in order for the associations to take affect. 
But Sequelize does have a way to dynamically drop the table and 
create a new one to overwrite existing tables and establish the new associations.

Let's navigate to the server.js file and locate the database connection at the bottom of the file.
In the sync method, there is a configuration parameter { force: false }. 
If we change the value of the force property to true, 
then the database connection must sync with the model definitions and associations. 
By forcing the sync method to true, 
we will make the tables re-create if there are any association changes.

This definition performs similarly to DROP TABLE IF EXISTS, which was used previously. 
This allows the table to be overwritten and re-created.

Another way to check if the tables have been dropped is to see if the user table is still populated. 
Then we should change this value back to false. 
Dropping all the tables every time the application restarts is no longer necessary 
and in fact will constantly drop all the entries and seed data we enter, 
which can get very annoying.
Let's change the database connection in the server.js file back to {force: false}

*/