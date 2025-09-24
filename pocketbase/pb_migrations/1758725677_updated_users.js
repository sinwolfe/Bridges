/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1736455494")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_ARhgLCDvg6` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_1736455494` ON `users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `idx_DNK4Y6ks8L` ON `users` (`username`)",
      "CREATE INDEX `idx_1fAdxBh9x0` ON `users` (`isVerified`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1736455494")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_ARhgLCDvg6` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_pbc_1736455494` ON `users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `idx_DNK4Y6ks8L` ON `users` (`username`)"
    ]
  }, collection)

  return app.save(collection)
})
