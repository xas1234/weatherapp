const Weather = function (data) {
    // SUKURIAMAS KLASĖ KURI PRIIMS DUOMENIS
    this.data = data

    this.errors = []
}
// SUKURIAMAS KLASĖS METODAS ICAO ĮVESČIAI TIKRINTI
Weather.prototype.validateUserInput = function () {
    if (this.data == '') {
        // KLAIDOS KODAS ESANT TUŠČIAI ĮVESČIAI
        this.errors.push('Please enter the ICAO code')
    } else if (
        // TIKRINIMAS AR LT ORO UOSTO ĮVESTIS
        this.data.toUpperCase() !== 'EYVI' &&
        this.data.toUpperCase() !== 'EYSA' &&
        this.data.toUpperCase() !== 'EYKA' &&
        this.data.toUpperCase() !== 'EYPA'
    ) {
        this.errors.push('It is not a Lithuanian airport ICAO code') // KLAIDOS KODAS ESANT NE LT ICAO ĮVESČIAI
    }
}
// KLASĖ EKSPORTUOJAMA
module.exports = Weather
