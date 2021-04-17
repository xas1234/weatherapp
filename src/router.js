const express = require('express') // PAREIKALAUJAMA NAUDOT EXPRESS MODULĮ
const router = express.Router() // SUKURIAMAS MARŠRUTIZATORIUS
// PAREIKALAUJAMA NAUDOTI controller.js ir realTimeData.js MODULIUS
const controller = require('./controllers/controller')
const services = require('./services/realTimeData')
// HTTP DUOMENŲ GAVIMAS ARBA SIUNTIMAS NURODYTU KELIU SU NURODYTA FUNKCIJA
router.get('/', controller.renderHomePage)

router.post('/', services.getRealTimeReports)

router.get('/database', controller.getDatabaseData)

router.get('/database/:icao', controller.getDatabaseByIcao)

router.get('/charts/:icao', controller.getChartByIcao)

router.get('/map', controller.renderMapPage)

// MARŠRUTIZATORIUS EKSPORTUOJAMAS
module.exports = router
