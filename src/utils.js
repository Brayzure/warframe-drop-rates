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
    }
}

module.exports = functions;