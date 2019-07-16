const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
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
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user) {
        throw new Error('Unable to Login!');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Unable to Login!');
    }

    return user;
};

userSchema.methods.toJSON = function toJSON() {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function generateAuthToken() {
    const token = jwt.sign({_id: this._id.toString()}, 'thisismynewcourse');

    this.tokens = this.tokens.concat({token});
    await this.save();

    return token;
}

/*
 * Hashing the password on user before saving
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

//Delete User Tasks when User is Removed
userSchema.pre('remove', async function remove(next) {
    await Task.deleteMany({owner: this._id});
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
