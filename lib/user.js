var redis = require("redis");
var bcrypt = require("bcrypt");
//Stvaranje Redis konekcije
var db = redis.createClient();

//Izvoz User funkcije
module.exports = User;

function User(obj) {
  for (var key in obj) {
    this[key] = obj[key];
  }
}

//Spremanje korisnika u Redis
User.prototype.save = function (fn) {
  if (this.id) {
    this.update(fn);
  } else {
    var user = this;
    db.incr("user:ids", function (err, id) {
      if (err) return fn(err);
      user.id = id;
      user.hashPassword(function (err) {
        if (err) return fn(err);
        user.update(fn);
      });
    });
  }
};

//Izmjena korisnika
User.prototype.update = function (fn) {
  var user = this;
  var id = user.id;
  db.set("user:id:" + user.name, id, function (err) {
    if (err) return fn(err);
    db.hmset("user:" + id, user, function (err) {
      fn(err);
    });
  });
};

//Generiranje lozinke
User.prototype.hashPassword = function (fn) {
  var user = this;
  bcrypt.genSalt(12, function (err, salt) {
    if (err) return fn(err);
    user.salt = salt;
    bcrypt.hash(user.pass, salt, function (err, hash) {
      if (err) return fn(err);
      user.pass = hash;
      fn();
    });
  });
};

/*var stevica= new User({
name:'Stevica',
pass:'stevicinalozinka',
age:'21'
});

stevica.save(function(err){
if(err) throw err;
console.log('user id %d',stevica.id);
}); */

//Dohvat korisnika
User.getByName = function (name, fn) {
  User.getId(name, function (err, id) {
    if (err) return fn(err);
    User.get(id, fn);
  });
};

//Dohvat korisnika prema Id-u
User.getId = function (name, fn) {
  db.get("user:id:" + name, fn);
};

//Dohvat korisnika iz Redis baze podataka
User.get = function (id, fn) {
  db.hgetall("user:" + id, function (err, user) {
    if (err) return fn(err);
    fn(null, new User(user));
  });
};

//Funkcija koja uspoređuje korisničko ime i lozinku
User.authenticate = function (name, pass, fn) {
  User.getByName(name, function (err, user) {
    if (err) return fn(err);
    if (!user.id) return fn();
    bcrypt.hash(pass, user.salt, function (err, hash) {
      if (err) return fn(err);
      if (hash == user.pass) return fn(null, user);
      fn();
    });
  });
};

//Vraćanje JSON za api
User.prototype.toJSON = function () {
  return {
    id: this.id,
    name: this.name,
  };
};
