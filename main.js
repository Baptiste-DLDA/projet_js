import * as R from "ramda";
import fs from "node:fs";

const normalize = word=>word.normalize("NFC").toLowerCase()

const cleanText = R.pipe(
    R.toLower,
    R.replace(/[.,!?;:()"\[\]{}<>«»'`’]/g, ''),
    R.replace(/\s+/g, ' '),
    R.trim
);

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

const buildTrigramModel = R.pipe(
    R.map(R.split(' ')),
    R.chain(words => R.aperture(3, words)),
    R.groupBy(triplet => `${triplet[0]} ${triplet[1]}`),
    R.map(R.pipe(
        R.map(R.nth(2)),
        R.countBy(R.identity),
        R.toPairs,
        R.sortBy(R.pipe(R.nth(1), Number)),
        R.reverse
    ))
);

const getTopNextWords = (model, context) => {
    const key2 = R.join(' ', R.takeLast(2, context));
    const key1 = R.last(context);
    const options = model[key2] || model[key1] || [];
    return R.pipe(
        R.map(R.nth(0)),
        R.uniq,
        R.take(3)
    )(options);
};


const main = () => {
    fs.readFile("./list.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
        }
        console.log("-----Modèle Next Letter-----")
        console.log(nextLetterModel(data,"propre"));
    });
    fs.readFile("./corpus_clean.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
        }

        const corpusLines = R.pipe(
            R.split('\n'),
            R.map(cleanText),
            R.reject(R.isEmpty)
        );

        const model = buildTrigramModel(corpusLines(data));
        console.log("-----Modèle Trigram Mots-----")
        console.log(getTopNextWords(model,R.pipe(cleanText, R.split(' '))("je suis")));
    });
};

main();