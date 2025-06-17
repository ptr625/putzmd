const fs = require('fs')
const chalk = require('chalk')
const util = require('util')

const totalFiturr = () =>{
var mytext = fs.readFileSync("./gisnaxd.js").toString()
var numUpper = (mytext.match(/case '/g) || []).length;
return numUpper
}

const listCase = () => {
const code = fs.readFileSync("./gisnaxd.js", "utf8")
var regex = /case\s+'([^']+)':/g;
var matches = [];
var match;
while ((match = regex.exec(code))) {
matches.push(match[1]);
}
let teks = `Total fitur: ${totalFiturr()} \n\n` 
matches.forEach(function (x) {
   teks += " ➤ " + x + "\n"
})
return teks
}
module.exports.listCase = listCase