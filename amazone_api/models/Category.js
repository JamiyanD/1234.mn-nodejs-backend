const mongoose = require("mongoose");
const { translirate, slugify } = require("transliteration")

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Categoriin neriig oruulna uu"],
    unique: true,
    trim: true,
    maxlength: [50, "Categoriin nernii urt deed tal n 50 temdegt bh ystoi."],
  },
  slug: String,

  description: {
    type: String,
    required: [true, "Categoriin tailbariig zaaval oruulah ystoi"],
    maxlength: [
      500,
      "Categoriin tailbariin urt deed tal n 50 temdegt bh ystoi.",
    ],
  },
  photo : {
    type: String,
    default: 'no-photo.jpg'
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating hamgiin bagadaa 1 baih ystoi'],
    max: [10, 'Rating hamgiin ihdee 10 baih ystoi']
  },
  averagePrice: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {toJSON: {virtuals : true}, toObject: {virtuals: true}});

CategorySchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'category',
  justOne: false
})

CategorySchema.pre("delete",async  function(next) {
  console.log("remove=-----")
  await this.model("Book").deleteMany({category: this._id})
  next();
})

CategorySchema.pre("save", function(next) {
  console.log(this.name)
  this.slug = slugify(this.name)
  this.averageRating = Math.floor(Math.random()*10) + 1;
  // this.averagePrice = Math.floor(Math.random()*100000) + 3000;
  next();
})

module.exports = mongoose.model("Category", CategorySchema);
