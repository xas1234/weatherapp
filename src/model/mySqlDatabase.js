const mysql = require('mysql') // REIKALAUJAMA NAUDOTI MYSQL MODULĮ

const pool = mysql.createPool({
    // PRISIJUNGIMAS PRIE DUOMENŲ BAZĖS
    connectionLimit: 100, // PRISIJUNGIMO LIMITAS
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb',
    port: '3306',
    multipleStatements: true, // DAUGIAU NEI VIENO TEIGINIO UŽKLAUSOS SIUNTIMO METU ĮGALINIMAS
})

let database = {
    // OBJEKTAS SU METODAIS, SKIRTAIS DIRBTI SU DUOMENŲ BAZE
    getAll: () => {
        // METODAS SKIRTAS GAUTI VISŲ LT ORO UOSTŲ DUOMENIS
        return new Promise((resolve, reject) => {
            pool.query(
                // UŽKLAUSA APIE 4 LT ORO UOSTŲ 24 VAL. DUOMENIS
                `SELECT * FROM weather ORDER BY observed DESC, station LIMIT 196`,
                (err, results) => {
                    if (err) {
                        // KLAIDOS ATVEJU GRĄŽINAMA KLAIDA
                        return reject(err)
                    }

                    return resolve(results) // UŽKLAUSOS ĮVYKDYMO ATVEJU GRĄŽINAMI DUOMENYS
                }
            )
        })
    },

    getIcao: (icao) => {
        // METODAS, SKIRTAS GAUTI PASIRINKTO LT ORO UOSTO DUOMENIS
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM weather WHERE icao = ? ORDER BY observed DESC LIMIT 49`,
                [icao],
                (err, results) => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(results)
                }
            )
        })
    },
    deleteOlderThan3Days: () => {
        // METODAS, SKIRTAS IŠTRINTI DUOMENIS
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM weather WHERE datediff(now(), weather.date) > 2; SET @num := 0; UPDATE weather SET ID = @num := (@num+1);
                 ALTER TABLE weather AUTO_INCREMENT = 1;`, //UŽKLAUSA DUOMENŲ IŠTRINIMUI, KURIE SENESNI NEI 2 DIENOS IR IŠNAUJO PASKIRIAMI ĮRAŠŲ ID.
                (err, results) => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(results)
                }
            )
        })
    },
}
setInterval(() => {
    database.deleteOlderThan3Days()
    console.log('Older than 3 days records deleted successfully') //IŠTRINIMO METODO INICIJAVIMAS KAS 3 DIEN
}, 259200000)

module.exports = {
    // MODULIŲ EKSPORTAVIMAS
    database,
    pool,
}
