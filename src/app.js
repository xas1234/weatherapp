const path = require('path') // REIKALAUJAMI NAUDOTI MODULIAI
const express = require('express')
const router = require('./router')
const app = express()
// RODINIO VARIKLIO KONFIGŪRACIJA IR NURODYTAS KELIAS
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static('src/views')) // STATINIŲ DOKUMENTŲ NAUDOJIMO FUNKCIJA
// PAREIKALAUTAS timeInserterInterval DOKUMENTO MODULIS
const {
    addWeathersToDatabaseEveryHalfHour,
} = require('./services/timeInserterInterval')
// INICIJUOJAMA TALPINIMO FUNKCIJA
addWeathersToDatabaseEveryHalfHour()

app.use(express.json()) // FUNKCIJA SKIRTA IDENTIFIKUOTA UŽKLAUSAS JSON FORMATU
app.use(express.urlencoded({ extended: true })) // FUNKCIJA SKIRTA OBJEKTĄ ATPAŽINTI KAIP MASYVA AR TEKSTĄ

app.use('/', router) // REIKALAUJA NAUDOT MARŠRUTOZATORIŲ
// PORTAS NAUDOJAMAS PRISKIRTAS ARBA JEI NEPRISKIRTA AUTOMATIŠKAI NAUDOJAMAS 3000
const port = process.env.PORT || 3000
// PROGRAMINĖS ĮRANGOS PALEIDIMAS NURODYTAME PORT
app.listen(port, () => {
    console.log(`The server is now running on Port ${port}...`)
})
