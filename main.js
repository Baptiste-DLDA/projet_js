//import * as R from "ramda";

import fs from "node:fs";

const buildModel = (file) => {
    let model = {};
    let lines;
    fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            console.error(err);
        }
        lines = data.split("\n");
        for (let word of lines) {
            word = word.normalize("NFC");
            if (word.length < 2) continue;

            for (let i = 0; i < word.length - 1; i++) {
                const current = word[i];
                const next = word[i + 1];

                if (!model[current]) model[current] = {};
                if (!model[current][next]) model[current][next] = 0;
                model[current][next]++;
            }
        }
        console.log(model);
    });
};

buildModel("./list.txt");