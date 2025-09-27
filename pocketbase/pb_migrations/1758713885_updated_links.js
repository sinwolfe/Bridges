/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_449060851")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_121766130",
    "hidden": false,
    "id": "relation3436165681",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "upload_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_449060851")

  // remove field
  collection.fields.removeById("relation3436165681")

  return app.save(collection)
})
