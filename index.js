const headers = require("./headers")
require("isomorphic-fetch")

var words = fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt")
    .then(response => response.text())
    .then(text => text.split("\n"))

let gkorisnici = []
let ggrupe = []
let gkanali = []
let gporuke = []
let gčlanstva = []
let godnosi = []

function getWords () {
    // remove \r
    words = words.then(words => words.map(word => word.replace("\r", "")))
    // remove words with non-ascii characters
    words = words.then(words => words.filter(word => !word.match(/[^a-z]/)))
    // remove words with less than 4 characters
    words = words.then(words => words.filter(word => word.length >= 4))
    // randomly choose 2500 words
    words = words.then(words => {
        let chosenWords = []
        for (let i = 0; i < 2500; i++) {
            const randomIndex = Math.floor(Math.random() * words.length)
            chosenWords.push(words[randomIndex])
            words.splice(randomIndex, 1)
        }
        return chosenWords
    })
    return words
}

function generateCSVfromJSON (json) {
    // json is an array
    const keys = Object.keys(json[0])
    let csv = ""
    for (let i = 0; i < keys.length; i++) {
        csv += keys[i] + ","
    }
    csv = csv.substring(0, csv.length - 1) + "\n"
    for (let i = 0; i < json.length; i++) {
        for (let j = 0; j < keys.length; j++) {
            csv += json[i][keys[j]] + ","
        }
        csv = csv.substring(0, csv.length - 1) + "\n"
    }
    return csv
}

function writeCSV (csv, name) {
    const fs = require("fs")
    fs.writeFile(`./csv/${name}.csv`, csv, function (err) {
        if (err) {
            return console.log(err)
        }
        console.log("Wrote file: " + name + ".csv")
    })
}

function generateHash () {
    const crypto = require("crypto")
    const hash = crypto.createHash("sha256")
    hash.update(Math.random().toString())
    return hash.digest("hex")
}

function generateID () {
    const crypto = require("crypto")
    const hash = crypto.createHash("sha256")
    hash.update(Math.random().toString())
    // incorporate unix timestamp into hash
    hash.update(Date.now().toString())
    return hash.digest("hex").substring(0, 8)
}

function generateDate () {
    // generate date within the last 2 weeks
    const date = new Date()
    const randomDays = Math.floor(Math.random() * 14)
    date.setDate(date.getDate() - randomDays)
    return date.toISOString().substring(0, 10)
}

async function generateString (length) {
    // string comprised of random words from words.txt
    const words = await getWords()
    let string = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * words.length)
        string += words[randomIndex] + " "
    }
    return string
}

async function generateKorisnik (amount) {
    const words = await getWords()
    let korisnici = []
    for (let i = 0; i < amount; i++) {
        let obj = {
            "ID korisnika": generateID(),
            "Ime": words[Math.floor(Math.random() * words.length)],
            "About": await generateString(6),
            "Hash": generateHash()
        }
        korisnici.push(obj)
    }
    gkorisnici = korisnici
    return gkorisnici
}

async function generateGrupa (amount) {
    const words = await getWords()
    let grupe = []
    for (let i = 0; i < amount; i++) {
        let obj = {
            "ID grupe": generateID(),
            "Ime": words[Math.floor(Math.random() * words.length)],
            "Invite link": "https://chat.nexus.team/invite/" + generateID(),
            "ID autora": gkorisnici[Math.floor(Math.random() * gkorisnici.length)]["ID korisnika"]
        }
        grupe.push(obj)
    }
    ggrupe = grupe
    return ggrupe
}

async function generateKanal (amount) {
    const words = await getWords()
    let kanali = []
    for (let i = 0; i < amount; i++) {
        let obj = {
            "ID kanala": generateID(),
            "ID grupe": ggrupe[Math.floor(Math.random() * ggrupe.length)]["ID grupe"],
            "Ime kanala": await generateString(2)
        }
        kanali.push(obj)
    }
    gkanali = kanali
    return gkanali
}

async function generatePoruka (amount) {
    const words = await getWords()
    let poruke = []
    for (let i = 0; i < amount; i++) {
        let obj = {
            "ID poruke": generateID(),
            "Sadržaj": await generateString(10),
            "ID Korisnika": gkorisnici[Math.floor(Math.random() * gkorisnici.length)]["ID korisnika"],
            "ID Kanala": gkanali[Math.floor(Math.random() * gkanali.length)]["ID kanala"],
            "Datum": generateDate()
        }
        poruke.push(obj)
    }
    gporuke = poruke
    return gporuke
}

async function generateČlanstvo (amount) {
    const words = await getWords()
    let članstva = []
    for (let i = 0; i < amount; i++) {
        let obj = {
            "ID grupe": ggrupe[Math.floor(Math.random() * ggrupe.length)]["ID grupe"],
            "ID korisnika": gkorisnici[Math.floor(Math.random() * gkorisnici.length)]["ID korisnika"]
        }
        članstva.push(obj)
    }
    gčlanstva = članstva
    return gčlanstva
}

async function generateOdnos (amount) {
    // keep in mind prijatelj and blocked can not both be true
    const words = await getWords()
    let odnosi = []
    for (let i = 0; i < amount; i++) {
        let obj = {
            "ID korisnika": gkorisnici[Math.floor(Math.random() * gkorisnici.length)]["ID korisnika"],
            "ID drugog korisnika": gkorisnici[Math.floor(Math.random() * gkorisnici.length)]["ID korisnika"],
            "Blokiran": Math.random() < 0.5 ? "true" : "false",
            "Prijatelj": Math.random() < 0.5 ? "true" : "false"
        }
        odnosi.push(obj)
    }
    godnosi = odnosi
    return godnosi
}

async function run () {
    // generate 200 korisnika
    // generate 50 grupa
    // generate 100 kanala
    // generate 1000 poruka
    // generate 200 članstava
    // generate 2000 odnosa
    const korisnici = await generateKorisnik(200)
    const grupe = await generateGrupa(50)
    const kanali = await generateKanal(100)
    const poruke = await generatePoruka(1000)
    const članstva = await generateČlanstvo(200)
    const odnosi = await generateOdnos(2000)
    // create csv directory
    const fs = require("fs")
    if (!fs.existsSync("./csv")) {
        fs.mkdirSync("./csv")
    }
    // write to csv
    writeCSV(generateCSVfromJSON(korisnici), "korisnici")
    writeCSV(generateCSVfromJSON(grupe), "grupe")
    writeCSV(generateCSVfromJSON(kanali), "kanal")
    writeCSV(generateCSVfromJSON(poruke), "poruka")
    writeCSV(generateCSVfromJSON(članstva), "članstvo")
    writeCSV(generateCSVfromJSON(odnosi), "odnos")
}

run()