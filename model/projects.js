var mongoose = require('mongoose');  
var projectSchema = new mongoose.Schema({  
  name: String,
  description: String,
  price: Number,
  doneJob: String,
  workers: String,
  owner: Number,
  archived: { type: Boolean, default: false },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now }
});
mongoose.model('Project', projectSchema);