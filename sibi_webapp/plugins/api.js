import axios from 'axios'

export default function(context, inject) {

    inject('api', {
        getDestination,
        getDestinations,
        getPopularCellars,
        getPlace,
        getPlaces,
        logIn,
        register,
        getPopularCellarsFilter,
        getPopularCellarsFiltered,
        getWineTypes,
        getDOs,
        setLastFilter,
        switchfav,
        getFav,
        getCloserPlaces,
        getCfRecommendations,
        getCbfRecommendations,
        getRecommendedRoute,
    })



    // places
    async function getPopularCellars() {
        let dest = await axios.get('http://localhost:3001/places/cellars/popular/').then((response => {
            return response.data
        }))
        return dest
    }

    async function getPopularCellarsFilter(page) {
        let dest = await axios.post(`http://localhost:3001/places/cellars/popularf/`, {
            page: page,
            dest: '',
            winetype: '',
            doo: ''
        }).then((response => {
            return response
        }))

        return dest.data
    }


    async function getPopularCellarsFiltered(page, dest, winetype, doo) {
        let d = await axios.post(`http://localhost:3001/places/cellars/popularf/`, {
            page: page,
            dest: dest,
            winetype: winetype,
            doo: doo
        }).then((response => {
            return response
        }))

        return d.data
    }

    async function getPlace(name) {
        let dest = await axios.get(`http://localhost:3001/place/${name}`).then((response => {
            return response.data._fields
        }))
        return dest
    }

    async function getPlaces(namelist) {
        let places = await axios.post(`http://localhost:3001/places/getSemicolonList/`, {
            list: namelist.join(';')
        }).then((response => {
            return response
        }))
        return places.data
    }

    // authentication
    async function logIn(email, password) {
        let user = await axios.post(`http://localhost:3001/auth/login/`, {
            email: email,
            password: password
        }).then((response => {
            return response
        }))
        return user
    }

    async function register(username, email, password) {
        let res = await axios.post('http://localhost:3001/auth/register', {
            username: username,
            email: email,
            password: password
        }).then((response => {
            return response.data
        }))
        if (res == 'ok') {
            return username
        } else {
            return false
        }
    }

    // destinations
    async function getDestinations(name) {
        let dest = await axios.get('http://localhost:3001/destinations/').then((response => {
            return response.data
        }))
        return dest
    }

    async function getDestination(name) {
        let dest = await axios.get(`http://localhost:3001/destination/${name}`).then((response => {}))
        return dest
    }

    // other filter lists
    async function getWineTypes() {
        let dest = await axios.get('http://localhost:3001/winetypes/').then((response => {
            return response.data
        }))
        return dest
    }

    async function getDOs(name) {
        let dest = await axios.get('http://localhost:3001/dos/').then((response => {
            return response.data
        }))
        return dest
    }

    // user data

    async function setLastFilter(username, dest, winetype, doo) {
        await axios.post(`http://localhost:3001/setlastfilter/`, {
            username: username,
            dest: dest,
            winetype: winetype,
            doo: doo
        })
    }

    async function getFav(place, username) {
        if (username != "") {
            let isFav = await axios.get(`http://localhost:3001/isfav/${place}/${username}`).then((response => {
                return response.data
            }))
            return isFav
        } else {
            return false
        }
    }

    async function switchfav(isfav, place, username) {
        await axios.post(`http://localhost:3001/switchfav/`, {
            isfav: isfav,
            place: place,
            username: username
        })
    }

    async function getCloserPlaces(ammount, target, label) {
        let places = await axios.post(`http://localhost:3001/closercoorsplaces/`, {
            ammount: ammount,
            target: target,
            label: label
        }).then((response => {
            return response
        }))
        return places.data
    }

    async function getCfRecommendations(username) {
        let indexes = await axios.get(`http://localhost:3001/places/cellars/cf/${username}`).then((response => {
            return response.data
        }))
        var places = []
        let blacklist = []
        for (var i = 0; i < indexes.length; i++) {
            let placesfavs = await axios.post(`http://localhost:3001/places/favs/`, {
                username: indexes[i][0],
                blacklist: blacklist.join(';')
            }).then(response => {
                places.concat(response.data)
                for (var i = 0; i < response.data.length; i++) {
                    blacklist.push(response.data[i].properties.name)
                }
                return response.data
            }).catch(err => {
                console.log('error') // no results for that user
            });
            placesfavs.forEach(function(x) {
                places.push(x)
            })
            places.concat(placesfavs)
        }
        return places
    }

    async function getCbfRecommendations(username) {
        let places = await axios.get(`http://localhost:3001/places/cellars/cbf/${username}`).then((response => {
            return response.data
        }))
        return places
    }

    async function getRecommendedRoute(username) {
        let places = await axios.get(`http://localhost:3001/recommendedroute/${username}`).then((response => {
            return response.data
        }))
        return places
    }


}