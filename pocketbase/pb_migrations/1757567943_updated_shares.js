/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2806778930")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_hdGymGgQt8` ON `shares` (`short_id`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1453550139",
    "max": 0,
    "min": 0,
    "name": "short_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2806778930")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_hdGymGgQt8` ON `shares` (`short_ID`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1453550139",
    "max": 0,
    "min": 0,
    "name": "short_ID",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
