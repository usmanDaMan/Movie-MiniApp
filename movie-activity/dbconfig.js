const mongoose = require('mongoose')
const url =
  'mongodb+srv://admin:admin@albert-m001-xex5r.mongodb.net/video?retryWrites=true&w=majority'
// const { connection } = mongoose
module.exports = () => {
  mongoose.connect(url).then(() => {
    console.log('Successfully connected!')
  })
}
