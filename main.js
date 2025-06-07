import * as R from "ramda";
import fs from "node:fs/promises";

const length = 6;

const main = async () => {
    try {
        const data = await fs.readFile("./30k_sentences.txt", "utf-8");
        //Sépration des lignes
        const lines = data.split('\n');

        //Nettoyage des lignes
        const sentences = lines.map(line => {
            const parts = line.split('\t');
            return parts.length > 1 ? parts.slice(1).join('\t') : '';
        }).filter(Boolean);

        //Rassembler tout le texte en une seule chaîne
        const fullText = sentences.join(' ');

        //Normalisation
        const words = fullText
            .toLowerCase()
            .normalize('NFC')
            .split(/\W+/)
            .filter(Boolean);

        const MarkovModel = (words) => {
            const model = {};
            for (let i = 0; i < words.length - 1; i++) {
                const current = words[i];
                const next = words[i + 1];
                if (!model[current]) model[current] = [];
                model[current].push(next);
            }
            return model;
        };

        const model = MarkovModel(words);

        const predictNextWord = (model, currentWord) => {
            const possible = model[currentWord];
            if (!possible || possible.length === 0) return null;

            const counts = R.countBy(R.identity, possible);
            const maxEntry = R.toPairs(counts).reduce(
                (max, entry) => (entry[1] > max[1] ? entry : max),
                ['', 0]
            );
            return maxEntry[0];
        };

        const generateSentence = (model, startWord) => {
            let sentence = [startWord.toLowerCase()];
            while (sentence.length < length) {
                const next = predictNextWord(model, sentence[sentence.length - 1]);
                if (!next) break;
                sentence.push(next);
            }
            return sentence.join(' ');
        };

        const start = "bonjour";
        const phrase = generateSentence(model, start, 4);
        console.log(`Phrase générée à partir de "${start}":`, phrase);

    } catch (err) {
        console.error(err);
    }
};

main();
