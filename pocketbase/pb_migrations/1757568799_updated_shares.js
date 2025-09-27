/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2806778930")

  // remove field
  collection.fields.removeById("number2862860510")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2806778930")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number2862860510",
    "max": null,
    "min": null,
    "name": "download_count",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
