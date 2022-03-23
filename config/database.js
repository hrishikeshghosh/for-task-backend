const mongoose = require('mongoose');



exports.connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {console.log("DataBase connected")}).catch(err => {console.log(err)});
}


// mongodb://127.0.0.1:27017/karoApp   - local database