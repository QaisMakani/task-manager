const express = require('express');
require('./db/mongoose');           //Not using anything from the file here but need to make sure it gets loaded

const userRouter = require('./routers/users');
const taskRouter = require('./routers/tasks');


const app = express();
const port = process.env.PORT || 3000;      //Setting Default port to 3000 to test locally

app.use(express.json());        //Configuring express to automatically parse incoming request as json
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
