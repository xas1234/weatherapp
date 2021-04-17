const axios = require('axios') // PAREIKALAUTA NAUDOTI AXIOS
const Weather = require('../model/Validate') // PAREIKALAUTA NAUDOTI VALIDATE.JS

const apiOptions = {
    headers: { 'X-API-Key': 'bcb4d2e8603946159104cc5d5f' }, // API RAKTAS
}
// ESAMU METAR IR TAF DUOMENŲ GAVIMO FUNKCIJA
exports.getRealTimeReports = async (req, res) => {
    const airport = req.body.airport // GAUTAS ICAO ŽYMUO
    const url = `https://api.checkwx.com/metar/${airport}/decoded` // ADRESAI IŠ KURIO IMAMI DUOMENYS
    const url2 = `https://api.checkwx.com/taf/${airport}/decoded`
    const airfieldAltData = [197.8, 78.94, 136.25, 10] // AERODROMO AUKŠČIAI METRAIS [VILNIUS,KAUNAS,ŠIAULIAI,PALANGA]
    const weather = new Weather(airport)
    weather.validateUserInput() // ICAO ŽYMENS TIKRINIMAS
    console.log(weather.errors)
    // VYKDOMA JEI NETIKO ICAO ŽYMUO
    if (weather.errors.length) {
        res.render('index', {
            error: weather.errors.toString(), // KLAIDOS PRANEŠIMAS
        })
    } // VYKDOMA JEI TIKO ICAO ŽYMUO
    else {
        try {
            const { data: metardata } = await axios.get(url, apiOptions) // METAR DUOMENŲ GAVIMAS SU HTTP GET
            const { data: tafdata } = await axios.get(url2, apiOptions) // TAF DUOMENŲ GAVIMAS SU HTTP GET
            // LT ORO UOSTŲ PAPILDOMŲ DUOMENŲ SKAIČIAVIMAS
            switch (metardata.data[0].icao) {
                case 'EYVI': // VYKDOMA JEIGU SUTAMPA ICAO ŽYMUO
                    pressureAltData = Math.round(
                        (1013 - metardata.data[0].barometer.hpa) * 9.15 +
                            airfieldAltData[0] // SLĖGIO AUKŠTIS
                    )
                    densityAltData = Math.round(
                        (metardata.data[0].temperature.celsius - 15) * 36.5 +
                            pressureAltData // TANKIO AUKŠTIS
                    )
                    QFEData = Math.round(
                        metardata.data[0].barometer.hpa -
                            airfieldAltData[0] / 9.15 // SLĖGIS, PAGAL ŽEMĖS LYGĮ
                    )
                    break

                case 'EYKA':
                    pressureAltData = Math.round(
                        airfieldAltData[1] +
                            (1013 - metardata.data[0].barometer.hpa) * 9.15
                    )
                    densityAltData = Math.round(
                        (metardata.data[0].temperature.celsius - 15) * 36.5 +
                            pressureAltData
                    )
                    QFEData = Math.round(
                        metardata.data[0].barometer.hpa -
                            airfieldAltData[1] / 9.15
                    )
                    break
                case 'EYSA':
                    pressureAltData = Math.round(
                        airfieldAltData[2] +
                            (1013 - metardata.data[0].barometer.hpa) * 9.15
                    )
                    densityAltData = Math.round(
                        (metardata.data[0].temperature.celsius - 15) * 36.5 +
                            pressureAltData
                    )
                    QFEData = Math.round(
                        metardata.data[0].barometer.hpa -
                            airfieldAltData[2] / 9.15
                    )
                    break

                default:
                    pressureAltData = Math.round(
                        airfieldAltData[3] +
                            (1013 - metardata.data[0].barometer.hpa) * 9.15
                    )
                    densityAltData = Math.round(
                        (metardata.data[0].temperature.celsius - 15) * 36.5 +
                            pressureAltData
                    )
                    QFEData = Math.round(
                        metardata.data[0].barometer.hpa -
                            airfieldAltData[3] / 9.15
                    )
                    break
            }
            // PEREINAMO LYGIO AUKŠČIO SKAIČIAVIMAS
            const transLevelData = Math.round(
                (5000 + (1013 - metardata.data[0].barometer.hpa) * 28) / 3.28
            )
            // SIUNČIAMAS INDEX.HBS ATVAIZDAVIMAS
            res.render('index', {
                metar: metardata, // SIUČIAMI DUOMENYS
                taf: tafdata,
                pressureAlt: pressureAltData,
                densityAlt: densityAltData,
                transLevel: transLevelData,
                QFE: QFEData,
            })
        } catch (error) {
            // ĮVYKUS KLAIDAI SIUNČIAMAS KLAIDOS PRANEŠIMAS 500
            console.log(error)
            res.sendStatus(500)
        }
    }
}
