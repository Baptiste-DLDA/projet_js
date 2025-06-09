import * as R from "ramda";
import fs from "node:fs";

const normalize = word => word.normalize("NFC").toLowerCase()
const total = R.pipe(R.map(R.nth(1)),R.sum);

const cleanText = R.pipe(
    R.toLower,
    R.replace(/[.,!?;:()"\[\]{}<>«»'`’]/g, ''),
    R.replace(/\s+/g, ' '),
    R.trim
);


const buildLetterModel = (data, ngram) => {
    return R.pipe(
        R.split('\n'),
        R.chain(word => R.aperture(ngram, normalize(word))),
        R.groupBy(ngramArray => ngramArray.slice(0, ngram - 1).join('')),
        R.map(R.pipe(
            R.map(ngramArray => ngramArray[ngram - 1]),
            R.countBy(R.identity),
            R.toPairs,
            R.sort(([, a], [, b]) => b - a),
        ))
    )(data);
};

const nextLetterMarkov = (model, word) => {
    const context = normalize(word);
    const options = model[context] || {};
    const sum = total(options);

    return R.pipe(
        R.map(([letter, count]) => [letter, (count / sum * 100).toFixed(1) + '%']),
        R.take(3)
    )(options);
};


const completeWord = (prefix, data) => {
    const normalizedPrefix = normalize(prefix);

    return R.pipe(
        R.split(/[.,!?;:()" \n]+/),
        R.filter(word => word.startsWith(normalizedPrefix)),
        R.countBy(R.identity),
        R.toPairs,
        R.sort(R.descend(R.nth(1))),
        counts => {
            const sum = total(counts)
            return R.pipe(
                R.map(([word, count]) => [word, (count / sum * 100).toFixed(2) + '%']),
                R.take(3)
            )(counts);
        }
    )(data);
};



const buildNgramModel = (corpus,ngram) => {
    return R.pipe(
        R.map(R.split(' ')),
        R.filter(words => words.length >= ngram-1),
        R.chain(words => R.aperture(ngram, words)),
        R.groupBy(ngramArray => ngramArray.slice(0, ngram - 1).join(' ')),
        R.map(R.pipe(
            R.map(ngramArray => ngramArray[ngram - 1]),
            R.countBy(R.identity),
            R.toPairs,
            R.sort(([, a], [, b]) => b - a),
        ))
    )(corpus);
};


const getTopNextWords = (model, context, ngram) => {
    const key = R.join(' ', R.takeLast(ngram - 1, context));
    const options = model[key] || [];
    const sum = total(options);

    return R.pipe(
        R.map(([word, count]) => [word, (count / sum * 100).toFixed(4) + '%']),
        R.take(3)
    )(options);
};


const main = () => {
    fs.readFile("./list.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
        }
        console.log("-----Modèle Next Letter-----")
        const word='propre';
        console.log("Contexte : " + word);

        const model = buildLetterModel(data,word.length+1);
        console.log(nextLetterMarkov(model, word));

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

        console.log("-----Modèle Complétion de mot-----");
        const prefix = "lun";
        console.log("Contexte : " + prefix);
        console.log(completeWord(prefix, data));


        console.log("-----Modèle Ngram Words-----")
        const phrase = "tu es"
        const ngram=phrase.split(' ').length+1;
        console.log("Contexte : " + phrase);
        const model = buildNgramModel(corpusLines(data),ngram);
        console.log(getTopNextWords(model,R.pipe(cleanText, R.split(' '))(phrase),ngram));
    });
};

main();