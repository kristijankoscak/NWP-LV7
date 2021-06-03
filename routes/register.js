var User= require('../lib/user');

//Funkcija za renderiranje forme
exports.form= function(req,res){
  res.render('register',{ title:'Registracija' });
};

//Funkcija za spremanje korisnika
exports.submit= function(req,res,next){
  //req.body.name je korisničko ime koje je korisnik upisao u forma za registraciju
  User.getByName(req.body.name,function(err,user){
    if(err) return next(err);
    //Ako je korisničko ime zauzeto to jest postoji u bazi
    if(user.id) {
      res.error("Korisničko ime je zauzeto!");
      res.redirect('back');
    } 
    else {
      //Stvori novog korisnika
      user= new User({
      name:req.body.name,
      pass:req.body.pass
      });
      //Spremi korisnika u Redis bazu podataka
      user.save(function(err){
        if(err) return next(err);
        //Odmah i prijavljujemo korisnika preko session varijable
        req.session.uid= user.id;
        //Preusmjeri na naslovnu stranicu
        res.redirect('/');
      });
    }
  });
}