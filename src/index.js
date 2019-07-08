const express = require('express');
require('./db/mongoose');           //Not using anything from the file here but need to make sure it gets loaded
const User = require('./models/user');
const Task = require('./models/task');


const app = express();
const port = process.env.PORT || 3000;      //Setting Default port to 3000 to test locally

app.use(express.json());        //Configuring express to automatically parse incoming request as json

app.post('/users', (req, res) => {
    const user = new User(req.body);
    user.save().then(() => {
        res.send(user);
    }).catch((error) => {
        res.status(400).send(error);        //status needs to be set before send
    });
});

app.get('/users', (req, res) => {
    User.find({}).then((users) => {
        res.send(users);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

app.get('/users/:id', (req, res) => {
    const _id = req.params.id;
    User.findById(_id).then((user) => {
        if(!user) {
            return res.status(404).send();
        }
        res.send(user);
    }).catch((error) => {
        res.status(500).send(error);
    });
});

app.post('/tasks', (req, res) => {
    const task = new Task(req.body);
    task.save().then(() => {
        res.status(201).send(task);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

app.get('/tasks', (req, res) => {
    Task.find({}).then((tasks) => {
        if(!tasks) {
            return res.status(404).send();
        }
        res.status(200).send(tasks);
    }).catch((err) => {
        res.status(500).send(err);
    })
}); 

app.get('/tasks/:id', (req, res) => {
    Task.findById(req.params.id).then((task) => {
        if(!task) {
            return res.status(404).send("");
        }
        res.send(task);
    }).catch((err) => {
        res.status(500).send();
    })
})


app.listen(port, () => {
    console.log('Server is up on port ' + port);
});