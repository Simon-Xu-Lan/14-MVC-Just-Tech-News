const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Post extends Model {
    // we're using JavaScript's built-in static keyword to indicate that the upvote method is one that's based on the Post model and not an instance method like we used earlier with the User model
    // See how it's almost the exact same code we implemented into the PUT route earlier? The only real difference here is that we're using models.Vote instead, and we'll pass the Vote model in as an argument from post-routes.js.
    static upvote(body, models) {
        return models.Vote.create({
            user_id: body.user_id,
            post_id: body.post_id
        })
        .then( () => {
            return Post.findOne({
                where: { id: body.post_id },
                attributes: [
                    'id',
                    'post_url',
                    'title',
                    'created_at',
                    [
                        sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'),
                        'vote_count'
                    ]
                ]
            })
        })
    }
}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        post_url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'id'
            }
        }
    }, 
    {
        sequelize,
        freezeTableName: true,
        underscored: true,
        modelName: 'post'
    }
)

module.exports = Post;
