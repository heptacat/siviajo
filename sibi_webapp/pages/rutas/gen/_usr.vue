<template>
    <div>
        <div v-if="!isAuthenticated" class="container text-center">
            <h1>
                <router-link to="/login"> Inicia sesión para poder ver rutas</router-link>
            </h1>
        </div>
        <div class="container" v-if="isAuthenticated">
            <div class="py-5 ">
                <h1>Ruta generada:</h1>
                <map-component-route :places="places" />
                <h3 class="mt-5">Bodegas recomendadas para esta ruta:</h3>
                <VueSlickCarousel :arrows="true" v-bind="settings" :dots="true" class="row" v-if="places.length > 0">
                    <div v-for="place in places" :key="place.properties.name" class="col-12">
                        <router-link :to="`/place/${place.properties.name}`">
                            <div class="card bg-light mt-4">
                                <img :src="`${place.properties.photoUrl}`" class="card-img" alt="No hay imagen">
                                <div class="card-body">
                                    <h5 class="card-title">{{place.properties.name}}</h5>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </VueSlickCarousel>
                <hr class="mt-5">
                <a href="/">Generar una ruta distinta</a>
            </div>
        </div>
    </div>
</template>


<script>
    import {
        mapState
    } from 'vuex'
    import VueSlickCarousel from 'vue-slick-carousel'
    import mapComponent from '~/components/mapComponent.vue'
    export default {
        data() {
            return {
                places: [],
                route: {
                    name: "",
                    placeNames: [""],
                    claceCoors: [""]
                },
                settings: {
                    "dots": true,
                    "infinite": false,
                    "initialSlide": 0,
                    "speed": 500,
                    "slidesToShow": 3,
                    "slidesToScroll": 1,
                    "swipeToSlide": true,
                    "rows": 1
                },
            }
        },
        components: {
            mapComponent,
            VueSlickCarousel
        },
        async asyncData({
            params,
            $api
        }) {
            var route = await $api.getRecommendedRoute(params.usr)
            var cbfPlaces = await $api.getCbfRecommendations(params.usr)
            var filteredplaces = []
            // filter by region
            cbfPlaces.forEach(function(x) {
                if (x[2] == route.region) {
                    filteredplaces.push(x)
                }
            })
            cbfPlaces = filteredplaces
            // get the most recommended 15
            if (cbfPlaces.length > 15) {
                cbfPlaces = cbfPlaces.slice(0, 15)
            }
            // get 5
            var recommendedNames = []
            if (cbfPlaces.length > 5) {
                for (var i = 0; i < 5; i++) {
                    var toadd = ""
                    while (toadd == "" || recommendedNames.indexOf(toadd) != -1) {
                        toadd = cbfPlaces[Math.floor(Math.random() * cbfPlaces.length)][0]
                    }
                    recommendedNames.push(toadd)
                }
            } else {
                recommendedNames = cbfPlaces
            }
            var places = await $api.getPlaces(recommendedNames)
            return {
                route,
                places
            }
        },
        computed: {
            ...mapState([
                'isAuthenticated',
                'loggedInUser',
            ])
        },
    }
</script>