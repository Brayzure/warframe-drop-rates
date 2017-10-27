const sass = require("node-sass");
const fs = require("fs");
const path = require("path");

function traverse(directory) {
    let listing = fs.readdirSync(directory);
    for(location of listing) {
        let stats = fs.statSync(path.resolve(directory, location));
        if(stats.isDirectory()) {
            traverse(path.join(directory, location));
        }
        else {
            if(location.endsWith(".scss")) {
                let file = path.resolve(directory, location);
                console.log(file);
                
                sass.render({
                    file
                }, (err, result) => {
                    fs.writeFile(file.replace(".scss", ".css"), result.css.toString(), (err) => {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            console.log("Successfully compiled css at location: ", file);
                        }
                    });
                });
            }
        }
    }
}

traverse("./public");