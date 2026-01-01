/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_401194191")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_961350965",
    "hidden": false,
    "id": "relation1400097126",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "country",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_401194191")

  // remove field
  collection.fields.removeById("relation1400097126")

  return app.save(collection)
})
