const mongoose = require("mongoose");
const { translirate, slugify } = require("transliteration")

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nomiin neriig oruulna uu"],
    unique: true,
    trim: true,
    maxlength: [250, "Nomiin nernii urt deed tal n 250 temdegt bh ystoi."],
  },
  photo : {
    type: String,
    default: 'no-photo.jpg'
  },
  author: {
    type: String,
    required: [true, "Zohiogchiin neriig oruulna uu"],
    trim: true,
    maxlength: [50, "Zohiogchiin nernii urt deed tal n 50 temdegt bh ystoi."],
  },
  rating: {
    type: Number,
    min: [1, 'Rating hamgiin bagadaa 1 baih ystoi'],
    max: [10, 'Rating hamgiin ihdee 10 baih ystoi']
  },
  price: {
    required: [true, "Nomiin uniig oruulna uu"],
    type: Number,
    min: [500, 'Rating hamgiin bagadaa 500 baih ystoi']
  },
  balance: Number,
  content: {
    type: String,
    required: [true, "Nomiin tailbariig oruulna uu"],
    trim: true,
    maxlength: [5000, "Nomin nernii urt deed tal n 20 temdegt bh ystoi."],
  },
  bestseller : {
    type: Boolean,
    default: false
  },
  available : [String],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {toJSON: {virtuals: true}, toObject : {virtuals:true}}
);

BookSchema.statics.computeCategoryAveragePrice = async function (catId) {
  const obj =await this.aggregate([
    {$match: {category: catId} },
    { $group: {_id: "$category", avgPrice: {$avg: "$price" }}}
  ])
1
  console.log(obj)
  let avgPrice = null;
  if(obj.length > 0) avgPrice = obj[0].avgPrice
 await this.model('Category').findByIdAndUpdate(catId, {averagePrice: obj[0].avgPrice})

 return obj
}


BookSchema.post('save', function(){
  this.constructor.computeCategoryAveragePrice(this.category)
})

BookSchema.post('remove', function(){
  this.constructor.computeCategoryAveragePrice(this.category)
})

BookSchema.virtual('zohiogch').get(function(){
  
  if(!this.author) return "";
  let tokens = this.author.split(' ');
  if (tokens.length === 1) tokens = this.author.split('.');
  if (tokens.length === 2) return tokens[1]

  return tokens[0]
})

module.exports = mongoose.model("Book", BookSchema);
