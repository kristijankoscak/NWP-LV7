//Parsiraj unos
function parseField(field) {
  return field
    .split(/\[|\]/)
    .filter(function(s){ return s });
}

//Gledaj svojstvo iz parse polja
function getField(req, field) {
  var val = req.body;
  field.forEach(function(prop){
    val = val[prop];
  });
  return val;
}

//Provjera polja koje validiramo
exports.required = function(field){
  field = parseField(field);
  return function(req, res, next){
    if (getField(req, field)) {
      next();
    } else {
      res.error(field.join(' ') + ' je obavezno');
      res.redirect('back');
    }
  }
};

//Poruka ako nije prošla validacija
exports.lengthAbove = function(field, len){
  field = parseField(field);
  return function(req, res, next){
    if (getField(req, field).length > len) {
      next();
    } else {
      res.error(field.join(' ') + ' mora imati više od ' + len + ' znaka');
      res.redirect('back');
    }
  }
};
