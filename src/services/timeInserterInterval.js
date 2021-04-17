const axios = require('axios') // PAREIKALAUJAMA NAUDOT AXIOS
const Weather = require('../model/Validate') // PAREIKALAUJAMA NAUDOT VALIDATE MODULI
const { pool } = require('../model/mySqlDatabase') // PAREIKALAUJAMA NAUDOT DUOMENŲ BAZĖS DOKUMENTO MODULĮ
const airports = ['EYVI', 'EYKA', 'EYSA', 'EYPA'] //ICAO ŽYMENŲ MASYVAS
const apiOptions = {
    headers: { 'X-API-Key': 'bcb4d2e8603946159104cc5d5f' }, // API RAKTAS
}
// FUNKCIJA ATSAKINGA UŽ METAR DUOMENŲ GAVIMĄ
const getWeather = async (airport) => {
    const url = `https://api.checkwx.com/metar/${airport}/decoded` // ADRESAS IŠ KURIO IMAMI DUOMENYS

    const weather = new Weather(airport) // NAUJAS OBJEKTAS ICAO TIKRINIMUI
    weather.validateUserInput() // ICAO ŽYMENS TIKRINIMAS

    if (weather.errors.length) return
    try {
        const { data } = await axios.get(url, apiOptions) // HTTP GET UŽKLAUSA

        return data // GAUTŲ DUOMENŲ GRĄŽINIMAS
    } catch (error) {
        // ESANT KLAIDAI FUNKCIJOS VEIKSMŲ STABDYMAS
        return
    }
}
// VĖJO ŽVARBUMO TIKRINIMAS
const windchillTemp = (param) => {
    if (param) {
        return param.celsius // JEI EGZISTUOJA GRĄŽINA DUOMENĮ
    } else return null // JEI NEEGZISTUOJA PRISKIRIA NULINĘ VERTĘ
}
// DINAMINIŲ DUOMENŲ TEKSTO TIKRINIMAS
const dynamicDataText = (param) => {
    if (param && param.length > 0) {
        return param[0].text
    } else return null
}
// DINAMINIŲ DUOMENŲ AUKŠČIO TIKRINIMAS
const dynamicDataHeight = (param) => {
    if (param && param.length > 0) {
        return param[0].meters
    } else return null
}
// DEBESŲ PADO TIKRINIMAS
const ceilingText = (param) => {
    if (param) {
        return param.text
    } else return null
}
// DEBESŲ PADO AUKŠČIO TIKRINIMAS
const ceilingHeight = (param) => {
    if (param) {
        return param.meters
    } else return null
}
// VĖJO KRYPTIES TIKRINIMAS
const windDeg = (param) => {
    if (param) {
        return param.degrees
    } else return null
}
// VĖJO GREIČIO TIKRINIMAS
const windSp = (param) => {
    if (param) {
        return param.speed_mps
    } else return null
}
// SKRYDŽIO TAISYKLIŲ TIKRINIMAS
const flightCat = (param) => {
    if (param) {
        return param
    } else return null
}
// FUNKCIJA ATSAKINGA UŽ DUOMENŲ PATALPINIMA KAS 30MIN
const addWeathersToDatabaseEveryHalfHour = () => {
    const time = 1800000 // 30MIN MILISEKUNDĖMIS

    // FUNKCIJA, ATSAKINGA UŽ JOS VIDUJE ESANČIŪ PROCESŲ ĮVYKDYMA NURODYTU INTERVALU
    setInterval(() => {
        // METAR DUOMENŲ GAVIMAS PRITAIKIUS KIEKVIENA MASYVO ICAO ŽYMENĮ
        airports.forEach(async (airport) => {
            const { data } = await getWeather(airport)

            const metar = data[0]

            // METAR DINAMINIAI DUOMENYS
            const flightRules = flightCat(metar.flight_category)
            const windDegrees = windDeg(metar.wind)
            const windSpeed = windSp(metar.wind)
            const windchill = windchillTemp(metar.windchill)
            const condText = dynamicDataText(metar.conditions)
            const cloudText = dynamicDataText(metar.clouds)
            const cloudHeight = dynamicDataHeight(metar.clouds)
            const ceilText = ceilingText(metar.ceiling)
            const ceilHeight = ceilingHeight(metar.ceiling)
            const dateForDelete = metar.observed.split('T')[0]
            // VISŲ DUOMENŲ TALPINIMAS Į MASYVĄ
            let myDataArray = [
                [
                    metar.raw_text,
                    metar.observed,
                    metar.station.name,
                    metar.icao,
                    flightRules,
                    windDegrees,
                    windSpeed,
                    metar.temperature.celsius,
                    metar.dewpoint.celsius,
                    metar.humidity.percent,
                    metar.barometer.hg,
                    metar.barometer.hpa,
                    metar.visibility.meters_float,
                    metar.elevation.meters,
                    windchill,
                    condText,
                    cloudText,
                    cloudHeight,
                    ceilText,
                    ceilHeight,
                    dateForDelete,
                ],
            ]
            // PAŽADU PAREMTA FUNKCIJA
            return new Promise((resolve, reject) => {
                // UŽKLAUSA Į DUOMENŲ BAZĘ DUOMENŲ MASYVO TALPINIMUI
                pool.query(
                    `INSERT INTO weather (raw_text, observed, station, icao, flight_category, windDegrees, windSpeed, temperature, dewpoint, humidity, altimeter\
                        , pressure, visibility, elevation, windchill, condtext, cloudtext, cloudheight, ceiltext, ceilheight, date) VALUES ?`,
                    [myDataArray],
                    (err, results) => {
                        if (err) {
                            return reject(err) // ATMETIMAS ESANT KLAIDAI
                        }
                        return resolve(results) // DUOMENŲ TALPINIMO ĮVYKDYMAS
                    }
                )
            })
        })
        console.log('METAR was sent to database')
    }, time)
}
// FUNCIJOS EKSPORTAVIMAS
module.exports = {
    addWeathersToDatabaseEveryHalfHour,
}
