var _Image = require('../models/image');

exports.indexRender = function (req, res){
  console.log(_Image.find);
  _Image.find({}, function (err, docs){
    if (err) {
      throw err;
    }
    var last = [];
    var newArray =[];
    for(var i = 0; i <docs.length; i += 3) {
      var row = [
      docs[i],
      docs[i+1],
      docs[i+2]
      ];  
      var filteredArray = row.filter(removeUndefined);
      newArray.push(filteredArray);  
    }
    function removeUndefined(elements) {
      return elements !== undefined;
    }
    last.push(docs.pop());

    res.render("index.jade",{
      images: docs,
      header: last,
      content: newArray 
    });
  });
}