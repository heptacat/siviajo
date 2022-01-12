const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require("neo4j-driver");
var cors = require("cors");
const {
    response,
    query,
} = require('express');
const {
    text
} = require('body-parser');

const app = express()

const neo4jUri = 'bolt://localhost:7687'
const neo4jUser = 'neo4j'
const neo4jpass = 'p'
const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jpass))

const port = 3001


// cors
app.use(cors({
    credentials: true, // --> configures the Access-Control-Allow-Credentials CORS header
    origin: function(origin, callback) {
        return callback(null, true);
    }
}))
app.use(bodyParser.json())

// authentication api

app.post('/auth/login/', async (req, res) => {
    const session = driver.session()
    resp = {
        email: req.body.email._value,
        password: req.body.password._value
    };
    user = { // returned if authentication fails
        properties: {
            username: false
        }
    }
    let query = "MATCH (u:User{email: '" + resp.email + "', password:'" + resp.password + "'}) return u"
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            user = result.get(0);
        },
        onCompleted: function() {
            res.json(user.properties)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.post('/auth/register', async (req, res) => {
    const session = driver.session()
    resp = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    let query = "CREATE (u:User{username:'" + resp.username + "', email:'" + resp.email + "', password:'" + resp.password + "'})"
    const runQuery = session.run(query).subscribe({
        onCompleted: function() {
            res.json('ok')
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

// destinations
app.get('/destination/:name', (req, res) => {
    const session = driver.session()
    let query = "MATCH (a:Destination {name:'" + req.params.name + "'}) RETURN a"
    destino = {}
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            destino = result.get(0);
        },
        onCompleted: function() {
            res.json(destino.properties)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.get('/destinations/', (req, res) => {
    const session = driver.session()
    let query = "MATCH (a:Destination) RETURN a"
    destinos = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            destinos.push(result.get(0).properties.name);
        },
        onCompleted: function() {
            res.json(destinos)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

// places

app.get('/places/cellars/popular/', (req, res) => {
    const session = driver.session()
    let query = "MATCH (n:Bodegas)-[:IS_IN]->(d:Destination) RETURN d.name, n ORDER BY n.nReviews DESC LIMIT 8"
    bodegas = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            result._fields[1].properties.destination = result._fields[0]
            bodegas.push(result.get(1).properties);
        },
        onCompleted: function() {
            res.json(bodegas)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.post('/places/cellars/popularf/', (req, res) => {
    const session = driver.session()
    params = {
        page: Number(req.body.page),
        dest: req.body.dest,
        winetype: req.body.winetype,
        doo: req.body.doo
    };
    slideLow = 18 * (params.page - 1)
    slideHigh = 18 * params.page
    let query = ''
    if (params.dest == '') {
        query = "MATCH p=(n:Bodegas{})-[:IS_IN]->(d:Destination{}) "
    } else {
        query = "MATCH (w:Wine{type:'" + params.winetype + "', do:'" + params.doo + "'})<-[:SELLS]-(n:Bodegas{})-[:IS_IN]->(d:Destination{name:'" + params.dest + "'}) "
    }
    query = query + "WITH DISTINCT n.name as name, n.photoUrl as photoUrl, d.name as destination, n.nReviews as nReviews\
    return collect(name)[" + slideLow + ".." + slideHigh + "] as names, collect(photoUrl)[" + slideLow + ".." + slideHigh + "] as photoUrls,\
    collect(destination)[" + slideLow + ".." + slideHigh + "] as destinations, count(name) as nResults, nReviews ORDER BY nReviews DESC"
    console.log(query)
    bodegas = []
    nResults = 0
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            for (var i = 0; i < result._fields[0].length; i++) {
                bodega = {}
                bodega.name = result._fields[0][i]
                bodega.photoUrl = result._fields[1][i]
                bodega.destination = result._fields[2][i]
                bodegas.push(bodega)
            }
            nResults = result._fields[3].low
        },
        onCompleted: function() {
            const obj = {
                bodegas,
                nResults
            }
            res.json(obj)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})


app.get('/place/:name', (req, res) => {
    const session = driver.session()
    let query = "MATCH (p:Place{name:'" + req.params.name + "'})-[:IS_IN]->(d:Destination) \
    OPTIONAL MATCH (p)-[:SELLS]->(w:Wine) \
    WITH p, d, collect(w) AS wines \
    OPTIONAL MATCH (p)<-[:REVIEWS]-(r:Review) \
    RETURN d.name, p, wines, collect(r)"
    place = {}
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            result._fields[1].properties.destination = result._fields[0]
            place = result
        },
        onCompleted: function() {
            res.json(place)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

// list wines types and DOs

app.get('/winetypes/', (req, res) => {
    const session = driver.session()
    let query = "MATCH(w:Wine) WHERE w.type <> '' RETURN DISTINCT w.type"
    wines = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            wines.push(result._fields[0]);
        },
        onCompleted: function() {
            res.json(wines)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.get('/dos/', (req, res) => {
    const session = driver.session()
    let query = "MATCH(w:Wine) WHERE w.do <> '' RETURN DISTINCT w.do"
    wines = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            wines.push(result._fields[0]);
        },
        onCompleted: function() {
            res.json(wines)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

// user data and rec. systems

app.post('/setlastfilter/', async (req, res) => {
    const session = driver.session()
    resp = {
        username: req.body.username,
        dest: req.body.dest,
        winetype: req.body.winetype,
        doo: req.body.doo
    };
    let query = "MATCH (u:User{username:'" + resp.username + "'})\
        CREATE (u)-[:SEARCHES]->(ff:Filters{region: '" + resp.dest + "', vino:'" + resp.winetype + "', do:'" + resp.doo + "'})"
    const runQuery = session.run(query).subscribe({
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.post('/switchfav/', async (req, res) => {
    const session = driver.session()
    resp = {
        isfav: req.body.isfav,
        place: req.body.place,
        username: req.body.username
    };
    var query = ''
    if (resp.isfav) {
        query = "MATCH (u:User{username: '" + resp.username + "'})\
        MATCH (p:Place{name: '" + resp.place + "'})\
        MERGE (u)-[:LIKES]->(p)"
    } else {
        query = "MATCH (u:User{username: '" + resp.username + "'})-[l:LIKES]->(p:Place{name: '" + resp.place + "'}) DELETE l"
    }
    const runQuery = session.run(query).subscribe({
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.get('/isfav/:place/:username', (req, res) => {
    const session = driver.session()
    let query = "MATCH path = (u:User{username: '" + req.params.username + "'})-[:LIKES]->(p:Place{name: '" + req.params.place + "'})\
    RETURN count(path)"
    isFav = false
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            isFav = result._fields[0].low
        },
        onCompleted: function() {
            res.json(isFav)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})

app.post('/closercoorsplaces/', (req, res) => {
    const session = driver.session()
    resp = {
        ammount: req.body.ammount,
        target: req.body.target,
        label: req.body.label
    };
    let query = "MATCH(p:" + resp.label + ")\
    WITH distinct p.name as names, p.mapsCoors as coors\
    RETURN collect(coors), collect(names)"
    coors = []
    places = []
    returns = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            coors = result._fields[0]
            places = result._fields[1]
        },
        onCompleted: function() {
            var closestOnes = closestcoors(resp.ammount, resp.target, coors)
            for (var i = 0; i < closestOnes.length; i++) {
                attempts = 0
                index = coors.indexOf(closestOnes[i])
                while (returns.includes(places[index]) && attempts < 5) {
                    index = coors.indexOf(closestOnes[i], index + 1)
                    attempts++
                }
                if (attempts < 5 && index != -1) {
                    returns.push(places[index])
                }
            }
            res.json(returns)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }

    })
})


// collaborative algorithm
app.get('/places/cellars/cf/:user', (req, res) => {
    const session = driver.session()
    let query = "MATCH (u1:User{username: '" + req.params.user + "'})-[:SEARCHES]->(f1:Filters)\
    match (u2:User)-[:SEARCHES]->(f2:Filters) WHERE u1 <> u2 AND (f1.vino = f2.vino OR f1.region = f2.region)\
    RETURN u1.username, u2.username, collect(f1.vino) AS vinos1, collect(f2.vino) AS vinos2, collect(f1.region) as region1, collect(f2.region) AS region2"
    ratios = {}
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            ratios[(result._fields[1])] =
                cfFilterRatio(result._fields[2].concat(result._fields[4]), result._fields[3].concat(result._fields[5]))
        },
        onCompleted: function() {
            // order ratios
            var orderedRatios = Object.keys(ratios).map(function(key) {
                return [key, ratios[key]];
            });
            orderedRatios.sort(function(first, second) {
                return second[1] - first[1];
            });
            res.json(orderedRatios)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})


app.post('/places/favs/', (req, res) => {
    const session = driver.session()
    resp = {
        username: req.body.username,
        blacklist: req.body.blacklist.split(';'),
    };
    let query = "MATCH (u:User{username: '" + resp.username + "'})-[:LIKES]->(p:Bodegas) WHERE NOT p.name  IN ['" + resp.blacklist.join("','") + "'] RETURN p"
    places = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            places.push(result._fields[0])
        },
        onCompleted: function() {
            res.json(places)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }

    })
})

app.post('/places/getSemicolonList/', (req, res) => {
    const session = driver.session()
    list = req.body.list.split(';')
    let query = "MATCH (p:Bodegas) WHERE p.name IN ['" + list.join("','") + "'] RETURN DISTINCT p"
    places = []
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            places.push(result._fields[0])
        },
        onCompleted: function() {
            res.json(places)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }

    })
})


// content-based algorithm
app.get('/places/cellars/cbf/:user', (req, res) => {
    const session = driver.session()
    // filtering by keywords is too expensive if they're not in a node property. Searching them in the description is not viable
    // keywords = ['evento', 'celebrar', 'cata', 'ruta', 'reunión', 'familiar', 'guía', 'finca', 'viña', 'propio', 'tierra', 'origen', 'reserva', 'tradicional', 'diferente', 'denominación', 'tempranillo', 'restaurante', 'enoturismo', 'actividad', 'aperitivo']

    var query = "MATCH (r:Review)-[:REVIEWS]->(b:Bodegas)-[:IS_IN]->(d:Destination)\
        WHERE b.nReviews <> ''\
        WITH r, d, b, b.name AS name, log(toInteger(b.nReviews)) as nReviewsRatio ORDER BY  nReviewsRatio desc\
        RETURN DISTINCT b.name, nReviewsRatio, AVG((r.rate/5.0)*0.65 + r.positivity*0.35) AS commentRatio, b.photoUrl, d.name, d.mapsCoors"
    nReviewsRatios = []
    commentRatios = []
    cellars = []
    cellarRecomendationRatio = []


    userProperties = []
    cellarProperties = []
    ratios = {}
    const runQuery = session.run(query).subscribe({
        onNext: function(result) {
            cellars.push([result._fields[0], result._fields[3], result._fields[4], result._fields[5]])
            nReviewsRatios.push(result._fields[1])
            commentRatios.push(result._fields[2])
        },
        onCompleted: function() {
            // normalize nReviewsRatios
            for (var i = nReviewsRatios.length - 1; i >= 0; i--) {
                nReviewsRatios[i] /= nReviewsRatios[0]
            }
            for (var i = 0; i < cellars.length; i++) {
                cellarRecomendationRatio.push(nReviewsRatios[i] * 0.1 + commentRatios[i] * 0.9)
            }

            query = "MATCH (u1:User{username: '" + req.params.user + "'})-[:SEARCHES]->(f1:Filters)\
                WITH collect(f1.vino) AS vinos, collect(f1.region) AS regiones\
                MATCH (d:Destination)<-[:IS_IN]-(b:Bodegas)-[:SELLS]->(w:Wine) WHERE w.type IN vinos OR d.region IN regiones\
                RETURN  b.name AS bodega, collect(w.type) AS winetype, [d.name] AS region, vinos as vinosUsuario, regiones as regionesUsuario, b.photoUrl, d.name"
            const runQuery2 = session.run(query).subscribe({
                onNext: function(result) {
                    userProperties = result._fields[3].concat(result._fields[4])
                    cellarProperties = result._fields[1].concat(result._fields[2])
                    ratios[result._fields[0]] = [result._fields[0], result._fields[5], result._fields[6], cbfFilterRatio(userProperties, cellarProperties)]
                },
                onCompleted: function() {
                    // normalize nReviewsRatios
                    for (var i = 0; i < cellars.length; i++) {
                        ratios[cellars[i][0]] = ratios[cellars[i][0]] == undefined ? [cellars[i][0], cellars[i][1], cellars[i][2], cellarRecomendationRatio[i] * 0.5, cellars[i][3]] : [ratios[cellars[i][0]][0], ratios[cellars[i][0]][1], ratios[cellars[i][0]][2], (cellarRecomendationRatio[i] * 0.25 + ratios[cellars[i][0]][3] * 0.75)]
                    }

                    // order ratios
                    var orderedRatios = Object.keys(ratios).map(function(key) {
                        return ratios[key];
                    });
                    orderedRatios.sort(function(first, second) {
                        return second[3] - first[3];
                    });
                    res.json(orderedRatios)
                    session.close();

                },
                onError: function(error) {
                    console.log("ERROR: " + error);
                }
            })


        }
    })
})



// routes

app.get('/recommendedroute/:user', (req, res) => {
    const session = driver.session()
    let query = "MATCH(d)<-[:IS_IN]-(r:Route)\
    MATCH (u1:User{username: '" + req.params.user + "'})-[:SEARCHES]->(f1:Filters)\
    RETURN d.name, collect(f1.region) AS userDestinations, r"
    regionRatio = 0
    route = {}

    const runQuery = session.run(query).subscribe({
        onNext: function(result) {

            affinity = cbfFilterRatio(result._fields[1], [result._fields[0]])
            if (affinity > regionRatio) {
                regionRatio = affinity
                route = result._fields[2]
                route.properties.region = result._fields[0]
            }
        },
        onCompleted: function() {
            // order ratios
            res.json(route.properties)
            session.close();
        },
        onError: function(error) {
            console.log("ERROR: " + error);
        }
    })
})








///////////////////////////////////
// server-side data manipulation //
///////////////////////////////////

// euclidean distance
function distance(refpoint, p) {
    return Math.sqrt(Math.pow(refpoint[0] - p[0], 2) + Math.pow(refpoint[1] - p[1], 2))
}

function closestcoors(howmany, refpoint, fields) {
    refpoint = refpoint.split(',')
    refpoint = [Number(refpoint[0]), Number(refpoint[1])]

    var distances = []
    for (var i = 0; i < fields.length; i++) {
        textcoors = fields[i].split(',')
        point = [Number(textcoors[0]), Number(textcoors[1])]
        distances.push(distance(refpoint, point))
    }
    var closestOnes = []
    var distancesloop = distances

    for (var i = 0; i < howmany; i++) {
        mindist = Math.min(...distancesloop) // closest place
        index = distances.indexOf(mindist)
        closestOnes.push(fields[index])
        distancesloop.splice(distancesloop.indexOf(mindist), 1)
    }
    return closestOnes
}

// colaborative filter
function cfFilterRatio(list1, list2) {
    // objects with filters and their ammount of occurrences
    const counts1 = {};
    const counts2 = {};
    list1.forEach(function(x) {
        counts1[x] = (counts1[x] || 0) + 1;
    });
    list2.forEach(function(x) {
        counts2[x] = (counts2[x] || 0) + 1;
    });
    // average of each filter
    count = 0
    avg1 = 0
    avg2 = 0
    Object.values(counts1).forEach(val => {
        avg1 += val;
        count++
    });
    avg1 = 1.0 * avg1 / count

    count = 0
    Object.values(counts2).forEach(val => {
        avg2 += val;
        count++
    });
    avg2 = 1.0 * avg2 / count
    // formula
    let num = 0
    let den1 = 0
    let den2 = 0
    filtros = Object.keys(counts1).concat(Object.keys(counts2));
    for (var i = 0; i < filtros.length; i++) {
        if (counts1[filtros[i]] != undefined && counts2[filtros[i]] != undefined) {
            num += 1.0 * (counts1[filtros[i]] - avg1) * (counts2[filtros[i]] - avg2)
            den1 += (1.0 * (counts1[filtros[i]] - avg1)) ** 2
            den2 += (1.0 * (counts2[filtros[i]] - avg2)) ** 2
        }
    }
    res = 1.0 * num / (Math.sqrt(den1) * Math.sqrt(den1))
    if (Number.isNaN(res)) res = 0
    return res
}

// content-based filter-related filter
function cbfFilterRatio(list1, listCellar) {
    // list1: user filters with repeated values
    // listCellar: cellar attributes
    const counts1 = {};
    list1.forEach(function(x) {
        counts1[x] = (counts1[x] || 0) + 1;
    });
    listCellar = [...new Set(listCellar)]
    sumUser = 0
    Object.values(counts1).forEach(val => {
        sumUser += val;
    });
    commonPoints = 0
    listCellar.forEach(function(x) {
        if (counts1[x] != undefined) {
            commonPoints += counts1[x]
        }
    });

    res = 1.0 * commonPoints / sumUser
    return res
}


app.listen(port, () => console.log(`App listening on port ${port}!`))