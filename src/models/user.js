const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        validate(value) {
            if(! validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age is invalid');
            }
        }
    }
});


/*
 * Setting up mongoose middleware on schema
 * Normal function to be used here since we need 'this' binding
 * 'this' refers to the model on which the operation is being performed. In this case user.
 */
userSchema.pre('save', async function callback(next) {
    if(this.isModified('password')) {           //This will be true in case of both creation and modification
        this.password = await bcrypt.hash(this.password, 8);        //8 is the number of rounds of hashing performed. Recommended by the creator of the algorithm.
    }
    next();     //Need to call this explicitly to tell mongoose to proceed with save
});

const User = mongoose.model('User', userSchema);

module.exports = User;
