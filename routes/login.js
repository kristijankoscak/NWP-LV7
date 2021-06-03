var User= require('../lib/user');

//Prikaz forme za prijavu
exports.form= function(req,res){
  res.render('login',{ title:'Login'});
};

//Provjera korisni�kih podataka
exports.submit= function(req,res,next){
  User.authenticate(req.body.name,req.body.pass,function(err, user){
    if(err) return next(err);
    if(user) {
      req.session.uid= user.id;
      res.redirect('/');
    }
    else{
      res.error("Podaci za prijavu nisu ispravni!");
      res.redirect('back');
    }
  });
};

//Odjava korisnika
exports.logout = function (req, res) {
  //Brisanje session-a
  req.session.destroy(function(err){
    if(err) throw err;
    res.redirect('/');
  })
};
