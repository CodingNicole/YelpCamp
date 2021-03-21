const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
  // problem: this only runs after upload to cloudinary
  if (!req.files.length) {
    req.flash(
      'error',
      'No campground created. You need to add at least one image'
    );
    return res.redirect(`/campgrounds/new`);
  }
  if (req.files.length > 2) {
    req.flash('error', 'No campground created. Maximum amount of 10 images.');
    return res.redirect(`/campgrounds/new`);
  }
  const geoData = await geocoder
    .forwardGeocode({ query: req.body.campground.location, limit: 1 })
    .send();
  const campground = new Campground(req.body.campground);
  if (!geoData.body.features.length) {
    req.flash('error', 'Location could not be found');
    campground.geometry = {
      type: 'Point',
      coordinates: [-97.9222112121185, 39.3812661305678],
    };
    campground.location = 'United States';
  } else {
    campground.geometry = geoData.body.features[0].geometry;
  }
  campground.images = req.files.map(f => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'Successfully made a new campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
  let geoData = await geocoder
    .forwardGeocode({ query: req.body.campground.location, limit: 1 })
    .send();
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map(f => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  if (!geoData.body.features.length) {
    req.flash('error', 'Location could not be found');
    campground.geometry = {
      type: 'Point',
      coordinates: [-97.9222112121185, 39.3812661305678],
    };
    campground.location = 'United States';
  } else {
    campground.geometry = geoData.body.features[0].geometry;
  }
  await campground.save();
  if (req.body.deleteImages) {
    if (req.body.deleteImages.length === campground.images.length) {
      req.flash(
        'error',
        'Image(s) not deleted. Campground needs to have at least one image!'
      );
      return res.redirect(`/campgrounds/${campground._id}/edit`);
    } else {
      for (let filename of req.body.deleteImages) {
        if (
          filename !== 'Seeds/pexels-cottonbro-5358788_rcmfz0' &&
          filename !== 'Seeds/pexels-cottonbro-5364783_v78esu'
        ) {
          await cloudinary.uploader.destroy(filename);
        }
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
  }
  req.flash('success', 'Successfully updated campground');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const images = campground.images;
  for (let image of images) {
    if (
      image.filename !== 'Seeds/pexels-cottonbro-5358788_rcmfz0' &&
      image.filename !== 'Seeds/pexels-cottonbro-5364783_v78esu'
    ) {
      await cloudinary.uploader.destroy(image.filename);
    }
  }
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground');
  res.redirect('/campgrounds');
};
