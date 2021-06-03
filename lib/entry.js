//Stvaranje Redic klijenta
var redis = require('redis');
var db = redis.createClient();

//Izvoz funkcije Entry iz modula
module.exports = Entry;

//Iteracija kroz objekt sa podacima
function Entry(obj) {
  for (var key in obj) {
    this[key] = obj[key];
  }
}

//Pretvara podatke u JSON i sprema u Redic bazu podataka
Entry.prototype.save = function(fn){
  var entryJSON = JSON.stringify(this);
  db.lpush(
    'entries',
    entryJSON,
    function(err) {
      if (err) return fn(err);
      fn();
    }
  );
};

//Funkcija koja dohvaæa unose iz baze podataka
Entry.getRange = function(from, to, fn){
  db.lrange('entries', from, to, function(err, items){
    if (err) return fn(err);
    var entries = [];

    items.forEach(function(item){
      entries.push(JSON.parse(item));
    });

    fn(null, entries);
  });
};

//Funkcija koja vraæa broj unosa u bazi
Entry.count = function(fn){
  db.llen('entries', fn);
};
