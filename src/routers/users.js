const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({
            user,
            token
        });
    } catch(e) {
        res.status(400).send(e);        //status needs to be set before send
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({
            user,
            token
        });
    } catch (error) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        //Only logging out from the requested device in case user is logged in from multiple devices
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        //Only logging out from the requested device in case user is logged in from multiple devices
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, (req, res) => {
    res.send(req.user);     //The auth middleware sets the user in the request
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if(!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Update!'});
    }
    try {
        const {user} = req;
        updates.forEach((update) => {
            user[update] = req.body[update]
        });
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000           //1 MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please Upload an Image'));
        }
        cb(undefined, true);
    }
});

//The argument passed to single is the name of the field in the request where we expect the image. Must match exactly.
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //The file is provided in req by multer middleware when no dest is provided in options
    const buffer = await sharp(req.file.buffer).
    resize({
        width: 250,
        height: 250
    }).
    png().
    toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});   
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error('Avatar Not Found!');
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
