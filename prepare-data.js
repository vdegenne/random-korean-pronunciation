#!/bin/node
const data = require('./data.json');
const fs = require('fs');

(async function () {
  const sets = []
  function loadAllSets(root) {
    if (root.sets.length > 0) {
      // sets.concat(root.sets)
      for (const set of root.sets) {
        sets.push(set)
        loadAllSets(set)
      }
    }
  }
  loadAllSets(data)
  let words = sets.map(s => s.words)
  words = words.reduce((acc,v) => acc.concat(v),[])
  words = words.map(w => w.w.trim());

  // remove duplicates
  words = [...new Set(words)];

  // we should also remove the parenthesis
  words = words.map(w => cleanWord(w));

  // remove long words
  words = words.filter(w => w.length < 5)

  fs.writeFileSync('words.js',`const words = ${JSON.stringify(words)};`);
})()


function cleanWord(word) {
  return word.replace(/\[.+]|\(.+\)|（.+）|「.+」/g,'').trim();
}