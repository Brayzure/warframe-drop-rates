const request = require('request');
const cheerio = require('cheerio');

const Database = require('../src/core/Database.js');

parseAll();

async function parseAll() {
	request({
		method: "GET",
		uri: "https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html"
	}, async (err, inc, body) => {
		if(err) {
			throw err;
		}

		const $ = cheerio.load(body);

		let tables = $('table');
		let data = [];
		for(prop in tables) {
			if(tables.hasOwnProperty(prop) && !isNaN(prop)) {
				data.push(tables[prop].children[0].children);
			}
		}
		let missionDrops = parseMissions(data[0]);
		let relicDrops = parseRelics(data[1]);
		let keyDrops = parseKeys(data[2]);
		let noSetLocationDrops = parseNoSetLocation(data[3]);
		let sortieDrops = parseSortie(data[4]);
		let cetusDrops = parseCetusBounties(data[5]);
		let modDrops = parseMods(data[6]);
		let enemyMods = parseEnemyMods(data[7]);
		let blueprintDrops = parseBlueprints(data[8]);
		let enemyBlueprints = parseEnemyBlueprints(data[9]);

		/*
		missions
		node  | sector  | mission_type
		------+---------+-------------
		Lares | Mercury | Defense

		enemies
		name           | mod_drop_chance | blueprint_drop_chance
		---------------+-----------------+----------------------
		Shadow Stalker | 1               | 0.5

		rewards
		source         | reward_type | rotation? | chance | item
		---------------+-------------+-----------+--------+----------------
		Lares          | rotation    | A         | 0.0667 | Synthula
		Sortie         | sortie      |           | 0.0679 | Rifle Riven Mod
		Shadow Stalker | mod         |           | 0.3056 | Molten Impact
		Shadow Stalker | blueprint   |           | 0.0553 | War Blueprint

		relics
		item                   | tier    | name | rating | chance
		-----------------------+---------+------+--------+-------
		Nikana Prime Blueprint | Axi     | A1   | Intact | 0.02
		*/

		await Database.nuke();
		let count;
		console.log("Pushing standard mission drops to the database...");
		count = 0;
		for(mission in missionDrops) {
			if(missionDrops.hasOwnProperty(mission)) {
				let m = {
					node: mission,
					sector: missionDrops[mission].sector,
					mission_type: missionDrops[mission].mission_type,
					event: missionDrops[mission].event
				}
				await Database.addMission(m);
				
				for(drop of missionDrops[mission].drops) {
					let reward = {
						source: mission,
						reward_type: missionDrops[mission].dropType,
						rotation: missionDrops[mission].dropType === "rotation" ? drop.rotation : "",
						chance: drop.chance,
						item: drop.item
					}
					try {
						count++;

						await Database.addReward(reward);
					}
					catch (err) {
						console.log(err);
					}
				}
			}
		}
		console.log(`Pushed ${count} standard mission drops to the rewards table!`);
		count = 0;
		console.log("Pushing key-based mission drops to the database...");

		for(mission in keyDrops) {
			if(keyDrops.hasOwnProperty(mission)) {
				for(drop of keyDrops[mission].drops) {
					let reward = {
						source: mission,
						reward_type: keyDrops[mission].dropType,
						rotation: keyDrops[mission].dropType === "rotation" ? drop.rotation : "",
						chance: drop.chance,
						item: drop.item
					}
					try {
						count++;
						await Database.addReward(reward);
					}
					catch (err) {
						console.log(err);
					}
				}
			}
		}
		console.log(`Pushed ${count} key-based mission drops to the rewards table!`);
		count = 0;
		console.log("Pushing transient mission drops to the database...");

		for(mission in noSetLocationDrops) {
			if(noSetLocationDrops.hasOwnProperty(mission)) {
				await Database.addMission({
					node: mission,
					sector: "",
					mission_type: "",
					event: false
				});
				for(drop of noSetLocationDrops[mission].drops) {
					let reward = {
						source: mission,
						reward_type: noSetLocationDrops[mission].dropType,
						rotation: noSetLocationDrops[mission].dropType === "rotation" ? drop.rotation : "",
						chance: drop.chance,
						item: drop.item
					}
					try {
						count++;
						await Database.addReward(reward);
					}
					catch (err) {
						console.log(err);
					}
				}
			}
		}
		console.log(`Pushed ${count} transient mission drops to the rewards table!`);
		count = 0;
		console.log("Pushing sortie drops to the database...");

		for(drop of sortieDrops.Sortie.drops) {
			let reward = {
				source: "Sortie",
				reward_type: "sortie",
				rotation: "",
				chance: drop.chance,
				item: drop.item
			}
			try {
				count++;
				await Database.addReward(reward);
			}
			catch (err) {
				console.log(err);
			}
		}
		console.log(`Pushed ${count} sortie drops to the rewards table!`);

		console.log("Pushing Cetus bounty rewards to the database...");
		count = 0;
		for(bounty in cetusDrops) {
			if(cetusDrops.hasOwnProperty(bounty)) {
				let b = {
					node: bounty,
					sector: cetusDrops[bounty].sector,
					mission_type: cetusDrops[bounty].mission_type,
					event: false
				}
				await Database.addMission(b);
				
				for(drop of cetusDrops[bounty].drops) {
					let reward = {
						source: bounty,
						reward_type: cetusDrops[bounty].dropType,
						rotation: cetusDrops[bounty].dropType === "stage" ? drop.rotation : "",
						stage: cetusDrops[bounty].dropType === "stage" ? drop.stage : "",
						chance: drop.chance,
						item: drop.item
					}
					try {
						count++;

						await Database.addReward(reward);
					}
					catch (err) {
						console.log(err);
					}
				}
			}
		}
		console.log(`Pushed ${count} Cetus bounty rewards to the rewards table!`);
		count = 0;
		console.log("Pushing enemy mod drops to the database...");

		for(enemy in enemyMods) {
			if(enemyMods.hasOwnProperty(enemy)) {
				let e = {
					name: enemy,
					mod_drop_chance: enemyMods[enemy].modDropChance
				}
				await Database.addEnemy(e);

				let drops = enemyMods[enemy].items;
				for (drop of drops) {
					let reward = {
						source: enemy,
						reward_type: "enemy_mod",
						rotation: "",
						chance: drop.chance,
						item: drop.mod
					}
					count++;
					await Database.addReward(reward);
				}
			}
		}
		console.log(`Pushed ${count} enemy mod drops to the rewards table!`);
		count = 0;
		console.log("Pushing enemy blueprint drops to the database...");

		for(enemy in enemyBlueprints) {
			if(enemyBlueprints.hasOwnProperty(enemy)) {
				let e = {
					name: enemy,
					blueprint_drop_chance: enemyBlueprints[enemy].blueprintDropChance
				}
				await Database.addEnemy(e);

				let drops = enemyBlueprints[enemy].items;
				for (drop of drops) {
					let reward = {
						source: enemy,
						reward_type: "enemy_blueprint",
						rotation: "",
						chance: drop.chance,
						item: drop.blueprint
					}
					count++;
					await Database.addReward(reward);
				}
			}
		}
		console.log(`Pushed ${count} enemy blueprint drops to the rewards table!`);
		count = 0;
		console.log("Pushing relic drops to the database...");

		for(relic of relicDrops) {
			process.stdout.write(`Checking relic ${count+1} of ${relicDrops.length}...\x1b[0G`)
			count++;
			await Database.addRelic(relic);
		}
		console.log(`Pushed ${count} relic drops to the relics table!`);

		process.exit();
	});
}

function parseMissions(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	let data = {};
	for(t of tables) {
		let sector, node, type;
		let event = false;
		let split = t[0][0].split('/');
		if(split[0].startsWith("Event: ")) {
			split[0] = split[0].slice(7);
			event = true;
		}
		sector = split[0].trim();

		// TODO: Instead, search for last set of parentheses
		let i1 = split[1].lastIndexOf('(');
		let i2 = split[1].lastIndexOf(')');
		type = split[1].substring(i1+1, i2).trim();
		split[1] = split[1].substring(0, i1) + split[1].substring(i2+1);
		
		node = split[1].replace(/ +/g, ' ').trim();


		data[node] = {
			event: event,
			sector: sector,
			mission_type: type,
			dropType: "",
			drops: []
		}

		t.splice(0, 1);
		let rotation;
		
		for(row of t) {
			if(row[0].startsWith("Rotation ")) {
				data[node].dropType = "rotation";
				rotation = row[0].slice(9);
			}
			else if(data[node].dropType == "rotation") {
				let drop = {
					rotation: rotation,
					item: row[0],
					chance: parseChance(row[1])
				}

				data[node].drops.push(drop);
			}
			else {
				data[node].dropType = "single";
				let drop = {
					item: row[0],
					chance: parseChance(row[1])
				}
				data[node].drops.push(drop);
			}
		}
		if(!data[node].dropType) {
			console.log(type, t);
		}
	}
	return data;
}

function parseRelics(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	let relics = [];
	for(t of tables) {
		let tier, name, rating;
		let split = t[0][0].split(' ');
		tier = split[0].trim();
		name = split[1].trim();
		rating = split[3].replace(/(\(|\))/g, '').trim();
		t.splice(0,1);
		for(row of t) {
			let drop = row[0];
			let chance = parseChance(row[1]);
			let d = {
				tier: tier,
				name: name,
				rating: rating,
				item: drop,
				chance: chance
			}
			relics.push(d);
		}
	}

	return relics;
}

function parseKeys(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				while(d.children[0].children) {
					d = d.children[0];
				}
				data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	let keys = {};
	for(t of tables) {
		let key = t[0][0].trim();
		keys[key] = {
			dropType: "",
			drops: []
		}
		t.splice(0, 1);

		let rotation;
		
		for(row of t) {
			if(row[0].startsWith("Rotation ")) {
				keys[key].dropType = "rotation";
				rotation = row[0].slice(9);
			}
			else if(keys[key].dropType == "rotation") {
				let drop = {
					rotation: rotation,
					item: row[0],
					chance: parseChance(row[1])
				}

				keys[key].drops.push(drop);
			}
			else {
				keys[key].dropType = "single";
				let drop = {
					item: row[0],
					chance: parseChance(row[1])
				}
				keys[key].drops.push(drop);
			}
		}
	}

	return keys;
}

function parseNoSetLocation(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				if(!d.children[0]) {
					data.push("");
				}
				else {
					while(d.children[0].children) {
						d = d.children[0];
					}
					data.push(d.children[0].data);
				}
				
			}
			current.push(data);
		}
	}
	let keys = {};
	for(t of tables) {
		let key = t[0][0].trim();
		keys[key] = {
			dropType: "",
			drops: []
		}
		t.splice(0, 1);

		let rotation;
		
		for(row of t) {
			if(row[0].startsWith("Rotation ")) {
				keys[key].dropType = "rotation";
				rotation = row[0].slice(9);
			}
			else if(keys[key].dropType == "rotation") {
				let drop = {
					rotation: rotation,
					item: row[0],
					chance: parseChance(row[1])
				}

				keys[key].drops.push(drop);
			}
			else {
				keys[key].dropType = "single";
				let drop = {
					item: row[0],
					chance: parseChance(row[1])
				}
				keys[key].drops.push(drop);
			}
		}
	}

	return keys;
}

function parseSortie(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				while(d.children[0].children) {
					d = d.children[0];
				}
				data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	tables.push(current);
	let keys = {};
	for(t of tables) {
		let key = t[0][0].trim();
		keys[key] = {
			dropType: "",
			drops: []
		}
		t.splice(0, 1);

		let rotation;
		
		for(row of t) {
			if(row[0].startsWith("Rotation ")) {
				keys[key].dropType = "rotation";
				rotation = row[0].slice(9);
			}
			else if(keys[key].dropType == "rotation") {
				let drop = {
					rotation: rotation,
					item: row[0],
					chance: parseChance(row[1])
				}

				keys[key].drops.push(drop);
			}
			else {
				keys[key].dropType = "single";
				let drop = {
					item: row[0],
					chance: parseChance(row[1])
				}
				keys[key].drops.push(drop);
			}
		}
	}

	return keys;
}

function parseCetusBounties(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				if(d.children[0]) data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	let data = {};
	for(t of tables) {
		let sector, node, type;
		/*
		let split = t[0][0].split('/');
		sector = split[0].trim();

		let i1 = split[1].lastIndexOf('(');
		let i2 = split[1].lastIndexOf(')');
		type = split[1].substring(i1+1, i2).trim();
		split[1] = split[1].substring(0, i1) + split[1].substring(i2+1);
		
		node = split[1].replace(/ +/g, ' ').trim();
		*/

		node = t[0][0];
		sector = "Cetus";
		type = "Bounty";

		data[node] = {
			sector: sector,
			mission_type: type,
			dropType: "stage",
			drops: []
		}

		t.splice(0, 1);
		let rotation, stage;
		
		for(row of t) {
			if(row[0].startsWith("Rotation ")) {
				rotation = row[0].slice(9);
			}
			else if(data[node].dropType == "stage") {
				if(row[0].startsWith("Stage")) {
					stages = parseStage(row[0], node);
				}
				else {
					let drop;
					for(stage of stages) {
						drop = {
							rotation: rotation,
							stage: stage,
							item: row[0],
							chance: parseChance(row[1])
						}

						data[node].drops.push(drop);
					}
				}
			}
			else {
				data[node].dropType = "single";
				let drop = {
					item: row[0],
					chance: parseChance(row[1])
				}
				data[node].drops.push(drop);
			}
		}
		if(!data[node].dropType) {
			console.log(type, t);
		}
	}
	return data;
}

function parseMods(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				while(d.children[0].children) {
					d = d.children[0];
				}
				data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	if(current.length) {
		tables.push(current);
	}
	let mods = {};
	for(t of tables) {
		let mod = t[0][0].trim();
		mods[mod] = {
			enemies: []
		}
		t.splice(0, 2);
		
		for(row of t) {
			let enemy, modDropChance, chance, overall;
			enemy = row[0];
			modDropChance = parseChance(row[1]);
			chance = parseChance(row[2]);
			overall = modDropChance * chance;
			let d = {
				enemy: enemy,
				modDropChance: modDropChance,
				chance: chance,
				overall: overall
			}
			mods[mod].enemies.push(d);
		}
	}

	return mods;
}

function parseEnemyMods(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				if(!d.children[0]) {
					data.push("");
				}
				else {
					while(d.children[0].children) {
						d = d.children[0];
					}
					data.push(d.children[0].data);
				}
			}
			current.push(data);
		}
	}
	if(current.length) {
		tables.push(current);
	}
	let enemies = {};
	for(t of tables) {
		let enemy = t[0][0].trim();
		enemies[enemy] = {
			modDropChance: parseChance(t[0][1]),
			items: []
		}
		t.splice(0, 1);
		
		for(row of t) {
			let mod, chance, overall;
			mod = row[1];
			chance = parseChance(row[2]);
			overall = chance * enemies[enemy].modDropChance;
			let d = {
				mod: mod,
				chance: chance,
				overall: overall
			}
			enemies[enemy].items.push(d);
		}
	}

	return enemies;
}

function parseBlueprints(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				while(d.children[0].children) {
					d = d.children[0];
				}
				data.push(d.children[0].data);
			}
			current.push(data);
		}
	}
	if(current.length) {
		tables.push(current);
	}
	let bps = {};
	for(t of tables) {
		let bp = t[0][0].trim();
		bps[bp] = {
			enemies: []
		}
		t.splice(0, 2);
		
		for(row of t) {
			let enemy, bpDropChance, chance, overall;
			enemy = row[0];
			bpDropChance = parseChance(row[1]);
			chance = parseChance(row[2]);
			overall = bpDropChance * chance;
			let d = {
				enemy: enemy,
				bpDropChance: bpDropChance,
				chance: chance,
				overall: overall
			}
			bps[bp].enemies.push(d);
		}
	}

	return bps;
}

function parseEnemyBlueprints(table) {
	let tables = [];
	let current = [];
	for(tag of table) {
		if(tag.children[0].attribs.class && tag.children[0].attribs.class.includes('blank-row')) {
			tables.push(current);
			current = [];
		}
		else {
			let data = [];
			let t = tag.children;
			for(d of t) {
				if(!d.children[0]) {
					data.push("");
				}
				else {
					while(d.children[0].children) {
						d = d.children[0];
					}
					data.push(d.children[0].data);
				}
			}
			current.push(data);
		}
	}
	if(current.length) {
		tables.push(current);
	}
	let enemies = {};
	for(t of tables) {
		let enemy = t[0][0].trim();
		enemies[enemy] = {
			blueprintDropChance: parseChance(t[0][1]),
			items: []
		}
		t.splice(0, 1);
		
		for(row of t) {
			let blueprint, chance, overall;
			blueprint = row[1];
			chance = parseChance(row[2]);
			overall = chance * enemies[enemy].blueprintDropChance;
			let d = {
				blueprint: blueprint,
				chance: chance,
				overall: overall
			}
			enemies[enemy].items.push(d);
		}
	}

	return enemies;
}

function parseChance(str) {
	let i1 = str.lastIndexOf('(');
	let i2 = str.lastIndexOf('%');
	let chance;
	if(i1 == -1) {
		let split = str.split(' ');
		let newStr = split[split.length-1].slice(0, -1);
		chance = ((+newStr)/100).toFixed(5);
	}
	else {
		chance = ((+str.substring(i1+1, i2).trim())/100).toFixed(5);
	}
	
	return parseFloat(chance);
}

function parseStage(stage, bounty) {
	let stageCount = {
		"Level 5 - 15 Bounty": 3,
		"Level 10 - 30 Bounty": 3,
		"Level 20 - 40 Bounty": 4,
		"Level 30 - 50 Bounty": 5,
		"Level 40 - 60 Bounty": 5
	}
	let stages = [];
	switch (stage) {
		case "Stage 1":
			return ["1"];
			break;
		case "Stage 2, Stage 3 of 4, and Stage 3 of 5":
			stages = ["2"];
			if(stageCount[bounty] > 3) stages.push("3");
			return stages;
			break;
		case "Stage 4 of 5 and Final Stage":
			if(stageCount[bounty] > 4) stages.push("4");
			stages.push(stageCount[bounty].toString());
			return stages;
		default:
			throw new Error("Unknown stage: ", stage);
			break;
	}
}