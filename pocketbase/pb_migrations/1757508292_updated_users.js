/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1736455494")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.isAdmin = true",
    "listRule": "@request.auth.isAdmin = true",
    "updateRule": "@request.auth.isAdmin = true || @request.auth.id = id",
    "viewRule": "@request.auth.isAdmin = true || @request.auth.id = id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1736455494")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id = id",
    "listRule": null,
    "updateRule": "@request.auth.id = id",
    "viewRule": "@request.auth.id = id"
  }, collection)

  return app.save(collection)
})
