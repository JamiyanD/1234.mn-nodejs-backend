const mongoose = require("mongoose")

const connectDB = async () => {
    console.log(process.env.MONGODB_URI)
    const conn = await mongoose.connect(process.env.MONGODB_URI
    //     , {
    //     useNewUrlParser: true,
    //     useCreateIndex: true,
    //     useFindAndModify: false,
    //     useUnifiedTopology: true
    // }
    )

    console.log(`MongoDB holbogdloo : ${conn.connection.host}`)
}

module.exports = connectDB