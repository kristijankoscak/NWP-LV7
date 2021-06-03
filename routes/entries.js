var Entry = require('../lib/entry');

//Dohvat objava
exports.list = function(req, res, next){
  var page = req.page;
  //Entry.getRange(0, -1, function(err, entries) {
  Entry.getRange(page.from, page.to, function(err, entries) {
    if (err) return next(err);

    res.render('entries', {
      title: 'Entries',
      entries: entries,
    });
  });
};

//Prikaz forme za unos objava
exports.form = function(req, res){
  res.render('post', { title: 'Objave' });
};

//Spremanje objava
exports.submit = function(req, res, next){
  var data = req.body;

  var entry = new Entry({
    "username": res.locals.user.name,
    "title": data.title,
    "body": data.body
  });

  entry.save(function(err) {
    if (err) return next(err);
    if (req.remoteUser) {
      res.json({message: 'Entry added.'});
    } else {
      res.redirect('/');
    }
  });
};
