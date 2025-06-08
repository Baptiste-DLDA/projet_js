import * as R from "ramda";
import fs from "node:fs";

const normalize = word=>word.normalize("NFC").toLowerCase()

const nextLetterModel = (data,word) => {
    return R.pipe(
        R.split('\n'),
        R.filter(R.startsWith(word)),
        R.map(normalize),
        R.map(R.drop(word.length)),
        R.map(R.head),
        R.countBy(R.identity),
        R.toPairs,
        R.sort(([, a], [, b]) => b - a),
        //R.take(3)
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