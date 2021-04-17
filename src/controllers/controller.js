const { database } = require('../model/mySqlDatabase') // PAREIKALAUJAMAS DUOMENŲ BAZĖS MODULIS
exports.renderHomePage = (req, res) => {
    res.render('index') // SIUNČIAMAS INDEX.HBS ATVAIZDAVIMAS
}
exports.renderMapPage = (req, res) => {
    res.render('map')
}
exports.getDatabaseData = async (req, res, next) => {
    try {
        let results = await database.getAll() // LAUKIAMA DUOMENŲ BAZĖS getAll DUOMENŲ ATSAKYMO

        res.render('database', { data: results }) // SIUNČIAMAS database.hbs ATVAIZDAVIMAS SU DUOMENIMIS
    } catch (error) {
        // KLAIDOS ATVJEU SIUNČIAMAS 500 KODAS
        console.log(error)
        res.sendStatus(500)
    }
}
exports.getDatabaseByIcao = async (req, res, next) => {
    try {
        let results = await database.getIcao(req.params.icao) // LAUKIAMA DUOMENŲ BAZĖS getIcao() DUOMENŲ ATSAKYMO PAGAL UŽDUOTĄ ARGUMENTĄ

        res.render('databaseIcao', { icaoData: results }) // SIUNČIAMAS databaseIcao.hbs ATVAIZDAVIMAS SU DUOMENIMIS
    } catch (error) {
        console.log(error) // KLAIDOS ATVJEU SIUNČIAMAS 500 KODAS
        res.sendStatus(500)
    }
}
exports.getChartByIcao = async (req, res, next) => {
    try {
        let results = await database.getIcao(req.params.icao) // LAUKIAMA DUOMENŲ BAZĖS getIcao() DUOMENŲ ATSAKYMO PAGAL UŽDUOTĄ ARGUMENTĄ
        const arrWindDeg = [] // TUŠTI METEOROLOGINIŲ DUOMENŲ MASYVAI
        const arrWindSpeed = []
        const arrTemp = []
        const arrDew = []
        const arrObs = []
        const arrHum = []
        const arrAlt = []
        const arrVisib = []
        // MASYVAI UŽPILDOMI 24H METEOROLOGINIAIS DUOMENIMIS
        for (const element of results) {
            arrObs.push(element.observed.split('T')[1].split(':', 2).join(':'))
            arrWindDeg.push(element.windDegrees)
            arrWindSpeed.push(element.windSpeed)
            arrTemp.push(element.temperature)
            arrDew.push(element.dewpoint)
            arrHum.push(element.humidity)
            arrAlt.push(element.altimeter)
            arrVisib.push(element.visibility)
        }
        res.render('chartsIcao', {
            // SIUNČIAMAS chartsIcao.hbs ATVAIZDAVIMAS SU DUOMENIMIS
            chart: {
                all: results,
                observed: JSON.stringify(arrObs.reverse()), // DUOMENŲ MASYVAS APSUKAMAS
                windDeg: arrWindDeg.reverse(),
                windSpeed: arrWindSpeed.reverse(),
                temperature: arrTemp.reverse(),
                dewpoint: arrDew.reverse(),
                humidity: arrHum.reverse(),
                altimeter: arrAlt.reverse(),
                visibility: arrVisib.reverse(),
            },
        })
    } catch (error) {
        // KLAIDOS ATVĖJU KODAS 500
        console.log(error)
        res.sendStatus(500)
    }
}
