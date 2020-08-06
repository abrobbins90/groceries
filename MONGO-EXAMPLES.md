# Just examples of commands you can run in the mongo shell








## find all meals that include the 'bell pepper' ingredient
db.nodes.find({"type": "meal", "edges": {$all: ["ingr_bell_pepper"]}})


## find the bell pepper ingredient document
db.nodes.find({"_id": "id_default_ingr_bell_pepper"})



## update all documents to have a weird 'hello' key
## for more on update notation, see https://docs.mongodb.com/manual/reference/operator/update-field/
db.nodes.update({}, {$set: {"hello": "hello"}}, {multi: true})


## rename a field, increasing its depth
db.nodes.update({"_id": "id_default_meal_ij"}, {$rename: {"hello": "temp.again"}})


## move non-instructions info into a subdict called quantityDict

### test out on a single document
db.nodes.update({"_id": "id_default_meal_hello", info: {$exists: false}}, {$set: {"info": {"instructions": ""}}})
db.nodes.update({"_id": "id_default_meal_hello"}, {$rename: {"info": "temp"}})
db.nodes.update({"_id": "id_default_meal_hello"}, {$rename: {"temp": "info.quantityDict"}})
db.nodes.update({"_id": "id_default_meal_hello"}, {$rename: {"info.quantityDict.instructions": "info.instructions"}})

### perform on all meal documents
db.nodes.update({"type": "meal", info: {$exists: false}}, {$set: {"info": {"instructions": "", "": 1}}}, {multi: true})
db.nodes.update({"type": "meal", "info.instructions": {$exists: false}}, {$set: {"info.instructions": ""}}, {multi: true})
db.nodes.update({"type": "meal"}, {$rename: {"info": "temp"}}, {multi: true})
db.nodes.update({"type": "meal"}, {$rename: {"temp": "info.quantityDict"}}, {multi: true})
db.nodes.update({"type": "meal", "info.quantityDict.instructions": {$exists: true}}, {$rename: {"info.quantityDict.instructions": "info.instructions"}}, {multi: true})
db.nodes.update({"type": "meal", "info.quantityDict.instructions": {$exists: false}}, {$set: {"info.instructions": ""}}, {multi: true})





{
   "_id": "id_default_meal_ij",
   "type": "meal",
   "name": "ij",
   "edges": [ ],
   "hello": "hello"
}
