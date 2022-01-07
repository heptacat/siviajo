<template>
    <div>
        <div v-if="!isAuthenticated" class="container text-center">
            <h1>
                <router-link to="/login"> Inicia sesión para poder ver rutas</router-link>
            </h1>
        </div>
        <div class="container" v-if="isAuthenticated">
            <div class="py-5 ">
                <h1>Ruta recomendada: {{route.name}}</h1>
                <p><b>Lugares: </b>{{route.placeNames.join(', ')}}</p>
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
                <router-link :to="`/rutas/gen/${loggedInUser}`">Generar una ruta distinta</router-link>
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
        methods: {
            async logout() {
                this.cfPlaces = await this.$api.getCfRecommendations(this.loggedInUser)
                this.$store.commit('logout')
                this.$router.push('/')
            },
        },
        async asyncData({
            params,
            $api
        }) {
            try {
                var route = await $api.getRecommendedRoute(params.usr)
                var closeGroups = []
                for (var i = 0; i < route.claceCoors.length; i++) {
                    // take a random cellar among the 3 closer ones in the route
                    var closer = await $api.getCloserPlaces(3, route.claceCoors[i], 'Bodegas')
                    var toadd = ""
                    while (toadd == "" || closeGroups.indexOf(toadd) != -1) {
                        toadd = closer[Math.floor(Math.random() * closer.length)]
                    }
                    closeGroups.push(toadd)
                }
                var places = await $api.getPlaces(closeGroups)
                return {
                    route,
                    places
                }
            } catch (e) {
                console.log("error")
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