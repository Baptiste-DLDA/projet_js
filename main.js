import * as R from "ramda";
import fs from "node:fs";

const nextLetterModel = (data,word) => {
    return R.pipe(
        R.split('\n'),
        R.filter(R.startsWith(word)),
        R.map(word=>word.normalize("NFC").toLowerCase()),
        R.map(R.drop(word.length)),
        )(data);
}


const main = () => {
    fs.readFile("./list.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
        }
        console.log(nextLetterModel(data,"bite"));
    });

};

main();