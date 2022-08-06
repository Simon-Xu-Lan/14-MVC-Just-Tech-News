const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const { STRING } = require('sequelize');
const bcrypt = require('bcrypt');

// create User model
class User extends Model {
    // set up method to run on instance data (per user) to check password
    // Using the keyword this, we can access this user's properties, including the password, which was stored as a hashed string.
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.password);
    }
    /*
    Why is async mode recommended over sync mode?

    If you are using bcrypt on a simple script, using the sync mode is perfectly fine. 
    However, if you are using bcrypt on a server, the async mode is recommended. 
    This is because the hashing done by bcrypt is CPU intensive, 
    so the sync version will block the event loop and prevent your application 
        from servicing any other inbound requests or events. 
    The async version uses a thread pool which does not block the main event loop.

    So, for a better user experience on a live app, 
        choose the async version to reduce the time a user has to wait to verify the password. 
    Here, however, we're going to use the sync version, just to expedite test development:
    */
}

User.init(
    {
        // define an id column
        // primary key: If we didn't define the model to have a primaryKey option set up anywhere, Sequelize would create one for us, but it's best we explicitly define all of the data. 
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        // username column
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                // this means the password must be at least four characters long
                len: [4]
            }
        }
    },
    
    {
        hooks: {
            // ### Create user
            // .then version
            // set up beforeCreated lifecycle "hook" functionality
            // use the beforeCreate() hook to execute the bcrypt hash function on the plaintext password.
            // In the bcrypt hash function, we pass in the userData object that contains the plaintext password in the password property. 
            // We also pass in a saltRound value of 10.
            // The resulting hashed password is then passed to the Promise object as a newUserData object with a hashed password property.
            // The return statement then exits out of the function, returning the hashed password in the newUserData function.
            /* 
            beforeCreate(userData) {
                return bcrypt.hash(userData.password, 10).then(newUserData => {
                    return newUserData
                });
            }
            */

            //  async functions that will make the code more concise and legible. We will use the async/await syntax to replace the Promise.
            // The keyword pair, async/await, works in tandem to make this async function look more like a regular synchronous function expression.
            /*
            The async keyword is used as a prefix to the function that contains the asynchronous function. 
            await can be used to prefix the async function, which will then gracefully assign the value from the response to the newUserData's password property. 
            The newUserData is then returned to the application with the hashed password.
            */
            async beforeCreate(newUserData) {
                newUserData.password = await bcrypt.hash(newUserData.password, 10)
                return newUserData;
            },

            // Set up beforeUpdate lifecycle "hook" functionality
            async beforeUpdate(updatedUserData) {
                updatedUserData.password = await bcrypt.hash(
                    updatedUserData.password,
                    10
                );
                return updatedUserData;
            }
        },
        sequelize, // Database connection
        timestamps: false, // don't automatically create createdAt/updatedAt timestamp fields
        freezeTableName: true, // don't pluralize table name
        underscored: true, // name use underscores instead of camel-caing 
        modelName: 'user' // make it so our model name stays lowercase in the database
    }

);

module.exports = User;