/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_121766130")

  // remove field
  collection.fields.removeById("bool1368277760")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_121766130")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool1368277760",
    "name": "visibility",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
