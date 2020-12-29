#!/bin/node
const data = require('./src/data.json');
const fs = require('fs');
const path = require('path');

(async function () {
  let sets = []
  function loadAllSets(set,prefix = '') {
    const fullname = path.join(prefix,set.name === 'root' ? '' : set.name.replace(/\//g,','));
    if (set.words.length > 0) {
      set.fullname = fullname;
      sets.push(set);
    }
    if (set.sets.length > 0) {
      for (const subset of set.sets) {
        loadAllSets(subset,fullname);
      }
    }
  }
  // load the sets
  loadAllSets(data)
  // filter the sets based on the words
  sets = sets.filter(set => {
    set.words = set.words.map(w => w.w);
    set.words = set.words.map(w => cleanWord(w));
    set.words = set.words.filter(w => w.length < 5);

    return set.words.length > 0;
  });
  // map the sets to retain only the important information
  sets = sets.map(set => ({
    // name
    n: set.fullname,
    // words
    w: set.words
  }));

  fs.writeFileSync('./src/words.js',`export const words = ${JSON.stringify(sets)};`);
})()


function cleanWord(word) {
  return word.replace(/\[.+]|\(.+\)|（.+）|「.+」/g,'').trim();
}