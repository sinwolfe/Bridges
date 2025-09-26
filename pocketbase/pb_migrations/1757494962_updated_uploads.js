/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_121766130")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1368277760",
    "maxSelect": 1,
    "name": "visibility",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "public",
      "unlisted",
      "password"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_121766130")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1368277760",
    "maxSelect": 1,
    "name": "visibility",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Public",
      "Unlisted",
      "Password"
    ]
  }))

  return app.save(collection)
})
