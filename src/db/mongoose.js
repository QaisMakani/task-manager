const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
    useNewUrlParser: true,
    useCreateIndex: true,            //To ensure when mongoose interacts with mongodb, the indexes are created
    useFindAndModify: false          //To supress deprecation warning when using findByIdAndUpdate
});