(function () {
    var element = document.getElementById('root');
    
    var httpRequest;
    var t = null;
    document.getElementById("search").oninput = wait;

    function wait() {
        if(t) {
            window.clearTimeout(t);
        }
        t = window.setTimeout(makeRequest, 500);
    }

    function makeRequest() {
        httpRequest = new XMLHttpRequest();
        console.log("Sending request...");

        if(!httpRequest) {
            console.log("Unable to create an XMLHttpRequest object.")
            return false;
        }

        httpRequest.onreadystatechange = updateField;
        httpRequest.open('GET', 'https://wfdrops.com/api/search?term=' + encodeURIComponent(document.getElementById("search").value) + "&t=" + Math.random());
        httpRequest.send();
    }

    function updateField() {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            if(httpRequest.status === 200) {
                //document.getElementById("result").innerHTML = '<code>' + JSON.stringify(JSON.parse(httpRequest.responseText), null, 4) + '</code>';
                var results = JSON.parse(httpRequest.responseText);

                // Clear out the existing table (if any)
                var body = document.getElementById("root");
                while(body.firstChild) {
                    body.removeChild(body.firstChild);
                }

                for(drops of results) {
                    console.log(drops.item_name);

                    // Create div containing a single Item listing
                    var itemDiv = createExpando(drops.item_name);
                    itemDiv.className = itemDiv.className + " root-listing";

                    var listing, div, table;

                    if(drops.sortie && drops.sortie.chance > 0) {
                        div = createItemSourceElement("sortie");
                        div.children[0].innerHTML = "Sortie: " + toPercent(drops.sortie.chance, 2);
                        div.className = "sortie-listing";

                        itemDiv.children[1].appendChild(div);
                    }

                    if(drops.enemies.length) {
                        listing = createItemSourceElement("Enemies");
                        listing.className = "listing";

                        table = createDropTable(["Enemy", "Chance"]);
                        table.className = table.className + " enemies";
                        populateDropTable(table, drops.enemies, "enemies");
                        listing.children[1].appendChild(table);

                        itemDiv.children[1].appendChild(listing);
                    }

                    if(drops.missions.length) {
                        listing = createItemSourceElement("Missions");

                        table = createDropTable(["Mission", "Chance"]);
                        table.className = table.className + " missions";
                        populateDropTable(table, drops.missions, "missions");
                        listing.children[1].appendChild(table);

                        listing.className = "listing";
                        itemDiv.children[1].appendChild(listing);
                    }

                    if(drops.relics.length) {
                        listing = createItemSourceElement("Relics");

                        table = createDropTable(["i", "Relic", "Chance"]);
                        table.className = table.className + " relics";
                        populateDropTable(table, drops.relics, "relics");
                        listing.children[1].appendChild(table);

                        listing.className = "listing";
                        itemDiv.children[1].appendChild(listing);
                    }

                    // Add Item listing to page
                    body.appendChild(itemDiv);
                }
            }
        }
    }

    function createExpando(title) {
        // Create div containing a single Item listing
        var expandoRoot = createExpandoRoot();

        // Create Item listing title div
        var expandoTitle = createExpandoTitle(title);
        expandoRoot.appendChild(expandoTitle);
        // Create Item listing content div
        var expandoTarget = createExpandoTarget();

        expandoRoot.appendChild(expandoTarget);

        return expandoRoot;
    }

    function createExpandoRoot() {
        var div = document.createElement('div');
        div.className = "listing";
        
        return div;
    }

    function createExpandoTitle(title) {
        var div = document.createElement('div');
        div.className = "expando closed";
        var itemNameP = document.createElement('p');
        itemNameP.innerHTML = title;
        div.appendChild(itemNameP);
        return div;
    }

    function createExpandoTarget() {
        var div = document.createElement('div');
        div.className = "expando-target";
        return div;
    }

    function createItemSourceElement(type) {
         // Single entry, handled differently
        if(type == "sortie") {
            var div = document.createElement('div');
            var p = document.createElement('p');
            p.className = "sortie";
            div.appendChild(p);

            return div;
        }
        // Listing
        else {
            var div = createExpando(type);

            return div;
        }
    }

    function createDropTable(headers) {
        var table = document.createElement('table');
        table.className = "drop-table";
        var tableHeadRow = document.createElement('tr');
        for(var i=0; i<headers.length; i++) {
            var entry = document.createElement('th');
            entry.innerHTML = headers[i];
            tableHeadRow.appendChild(entry);
        }
        table.appendChild(tableHeadRow);

        return table;
    }

    function createDropEntry(entries) {
        var row = document.createElement('tr');
        for(var i=0; i<entries.length; i++) {
            var entry = document.createElement('td');
            entry.innerHTML = entries[i];
            row.appendChild(entry);
        }

        return row;
    }

    function populateDropTable(table, drops, type) {
        if(type == "enemies") {
            for(var i=0; i<drops.length; i++) {
                var enemy = drops[i];
                var chance = toPercent(enemy.item_chance, 2) + " (" + toPercent(enemy.chance, 2) + " per kill)";
                var entries = [enemy.source, chance];
                var row = createDropEntry(entries);
                table.appendChild(row);
            }
        }
        else if(type == "missions") {
            for(var i=0; i<drops.length; i++) {
                var mission = drops[i];
                var entries = [];
                var data = [];
                if(mission.mission_type) {
                    data.push(mission.mission_type);
                }
                if(mission.rotation) {
                    data.push("Rotation " + mission.rotation);
                }

                var missionDetails = data.length ? "(" + data.join(' / ') + ")" : "";
                var missionName = mission.node;
                if(mission.sector) {
                    missionName = mission.sector + " / " + missionName;
                }
                if(missionDetails) {
                    entries.push(missionDetails + " " + missionName);
                }
                else {
                    entries.push(missionName);
                }

                entries.push(toPercent(mission.chance, 2));

                var row = createDropEntry(entries);
                table.appendChild(row);
            }
        }
        else if(type == "relics") {
            for(var i=0; i<drops.length; i++) {
                var relic = drops[i];
                var chance = toPercent(relic.chance, 2);
                var relicName = relic.tier + " " + relic.name + " (" + relic.rating + ")";
                var entries = [(relic.vaulted?"Vaulted":""), relicName, chance];
                var row = createDropEntry(entries);
                if(relic.vaulted) {
                    row.className = "vaulted";
                }
                table.appendChild(row);
            }
        }
    }

    function toPercent(number, precision) {
        return (number*100).toFixed(precision).toString() + '%';
    }
}());