const Sequelize = require('sequelize');
const sequelize = require('../database/config');
const Model = Sequelize.Model;
const bcrypt = require('bcrypt-nodejs');

class User extends Model {
    async encryptPassword() {
        try {
            const success = await encryptPassword(this.password);
            this.password = success;
        }
        catch (err) {
            console.error(err);
        }
    }

    async verifyPassword(password) {
        try {
            return verifyPassword(password, this.password);
        }
        catch (err) {
            console.error(err);
        }
    }
}
User.init({
    username: Sequelize.TEXT,
    password: Sequelize.TEXT,
    role: Sequelize.TEXT
}, { sequelize, modelName: 'user' });

User.beforeSave( async (user, options) => {
    await user.encryptPassword();
});

function encryptPassword(password) {
    const saltRounds = 10;
    return new Promise( (resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) return reject(err);
            bcrypt.hash(password, salt, null, (err, hash) => {
                if (err) return reject(err);
                return resolve(hash);
            });
        });
    });
}

function verifyPassword(password, hash) {
    console.log('password:', password, 'hash:', hash);
    return new Promise( (resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

// function _hashPassword(password) {
//     return bcrypt.hashSync(password);
// }

User.sync();

module.exports = User;