const mongoose = require('mongoose');



exports.connectDatabase = () => {
    mongoose.connect("mongodb://127.0.0.1:27017/karoApp").then(() => {console.log("DataBase connected")}).catch(err => {console.log(err)});
}
