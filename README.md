# Warframe Drop Table API
Future home for the third-party drop table RESTful API.

### Base URL
`https://warframe.lessis.moe/api` (Not currently in service)  

### API Version: v1

## Routes

#### GET `/search`
Used to search the database for any items that match the search term provided.

##### Parameters
- term - The search term

##### Response
An object, where every property is a single Drop resource.  
Ex. (`term=Forma`)  
```js
{
    "Forma": Drop,
    "Forma Blueprint": Drop
}
```

## Resources
The API makes use a several different resource types, described below.

### Drop
Represents the drop chances for a single item.

Property | Value Type | Description
--- | --- | ---
missions | MissionItem[] | An array of MissionItem resources.
relics | RelicItem[] | An array of RelicItem resources.
enemies | EnemyItem[] | An array of EnemyItem resources.

Example:
```js
{
    missions: [
        MissionItem,
        MissionItem,
        MissionItem
    ],
    relics: [
        RelicItem,
        RelicItem,
        RelicItem,
        RelicItem,
        RelicItem
    ]
}
```

---

### EnemyItem
Represents the data related to a drop from an ingame enemy.

Property | Value Type | Description
--- | --- | ---
source | String | The name of the enemy
item_type | String | The type of item, `"mod"` or `"blueprint"`
blueprint_chance | Float? | The chance that the enemy drops a blueprint. `null` if dropped item is a mod.
mod_chance | Float? | The chance that the enemy drops a mod. `null` if dropped item is a blueprint.
item_chance | Float | The chance the item drops, assuming a drop occurs
chance | Float | The chance the item drops each time the enemy is killed

Example:
```js
{
    "source": "Corrupted Warden",
    "item_type": "blueprint",
    "blueprint_chance": 0.01,
    "item_chance": 1,
    "chance": 0.01
}
```

---

### RelicItem
Represents the data related to a drop from a relic.

Property | Value Type | Description
--- | --- | ---
tier | String | The tier of the relic
name | String | The name of the relic
rating | String | The refined status of the relic
item | String | The item that drops from the relic
chance | Float | The chance the item will drop
vaulted | Boolean | Whether or not the relic is vaulted

Example:
```js
{
    "tier": "Axi",
    "name" : "B2",
    "rating": "Radiant",
    "item": "Forma Blueprint",
    "chance": 0.2,
    "vaulted": false
}
```

---

### MissionItem
Represents the data related to an ingame mission.

Property | Value Type | Description
--- | --- | ---
node | String | The name of the location of the mission
sector | String? | The region where the node is located. Will be `null` if one does not exist
mission_type | String? | The mission type. Will be `null` if one does not exist
rotation | String/Boolean? | The rotation the item may drop on. Will be `false` if mission type does not support rotations. Will be `null` if not applicable.
event_exclusive | Boolean? | Whether the node is part of an event? Not sure. Will be `null` if not applicable
item | String | The item that drops from the mission
chance | Float | The chance the item drops from the mission

Example:
```js
{
    "node": "Orokin Derelict Defense",
    "sector": "Derelict",
    "mission_type": "Defense",
    "rotation": "C",
    "event_exclusive": false,
    "item": "Forma Blueprint",
    "chance": 0.2256
}
```

## Constants
Useful figures used throughout the API.

### Relic Drop Chances
The chance an item drops from a relic, based on its rarity and the relic's refinement level.
```js
{
    "Common": {
        "Intact": 0.253,
        "Exceptional": 0.233,
        "Flawless": 0.2,
        "Radiant": 0.167
    },
    "Uncommon": {
        "Intact": 0.11,
        "Exceptional": 0.13,
        "Flawless": 0.17,
        "Radiant": 0.20
    },
    "Rare": {
        "Intact": 0.02,
        "Exceptional": 0.04,
        "Flawless": 0.06,
        "Radiant": 0.1
    }
}
```

## Contributing
The API is currently in a very early state of development, and is
not ready for contributions. This section will be revised in the
future.