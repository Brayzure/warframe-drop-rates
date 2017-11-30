const functions = {
    splitByRotation: function(dropList) {
        let rotations = {};
        for(drop of dropList) {
            if(!rotations[drop.rotation]) {
                rotations[drop.rotation] = [];
            }

            rotations[drop.rotation].push(drop);
        }

        return rotations;
    },
    splitByStage: function(dropList) {
        let rotations = {};
        for(drop of dropList) {
            if(!rotations[drop.rotation]) {
                rotations[drop.rotation] = {};
            }
            if(!rotations[drop.rotation][drop.stage]) {
                rotations[drop.rotation][drop.stage] = [];
            }

            rotations[drop.rotation][drop.stage].push(drop);
        }

        return rotations;
    }
}

module.exports = functions;