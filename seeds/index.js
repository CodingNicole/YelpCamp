const mongoose = require('mongoose');

const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // Your User ID
      author: '602a1e076f6a420f4939447c',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate aspernatur praesentium aperiam neque, odio porro harum nam soluta vero, voluptatum, facilis veritatis. Magnam, eum eligendi! Neque et debitis laudantium error!',
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url:
            'https://res.cloudinary.com/dija9nq32/image/upload/v1614442033/YelpCamp/di4boseztqrmajqopzop.jpg',
          filename: 'YelpCamp/di4boseztqrmajqopzop',
        },
        {
          url:
            'https://res.cloudinary.com/dija9nq32/image/upload/v1614443276/YelpCamp/axczpyju1wdgpeqizbn9.jpg',
          filename: 'YelpCamp/tpcioxese1yl80qmqzyw',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
