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

const buildNgramModel = (corpus,ngram) => {
    return R.pipe(
        R.map(R.split(' ')),
        R.filter(words => words.length >= ngram),
        R.chain(words => R.aperture(ngram, words)),
        R.groupBy(ngramArray => ngramArray.slice(0, ngram - 1).join(' ')),
        R.map(R.pipe(
            R.map(ngramArray => ngramArray[ngram - 1]), // dernier mot
            R.countBy(R.identity),
            R.toPairs,
            R.sortBy(R.pipe(R.nth(1), Number)),
            R.reverse
    ))
)(corpus)};

const getTopNextWords = (model, context, ngram) => {
    const key = R.join(' ', R.takeLast(ngram - 1, context));
    const options = model[key] || [];
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
        console.log("Contexte : propre")
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

        console.log("-----Modèle 4gram Mots-----")
        console.log("Contexte : tu es très")
        const model4 = buildNgramModel(corpusLines(data),4);
        console.log(getTopNextWords(model4,R.pipe(cleanText, R.split(' '))("tu es très"),4));
    });
};

main();