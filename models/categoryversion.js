var schema = require('../schema');

var categorySchema = schema.category;

var CategoryModel = (function(){

  function CategoryModel(){
    
  }

  function findAll(){
    return categorySchema.findAll(); 
  }

  return CategoryModel;
})


module.exports = categorySchema;

