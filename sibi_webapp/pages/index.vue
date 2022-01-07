<template>
    <div>
        <div class="container">
            <div class="py-5 ">
                <h1>
                    <router-link to="/bodegas/populares/1">Bodegas populares</router-link>
                </h1>
                <VueSlickCarousel :arrows="true" v-bind="isAuthenticated? settings:settings_out" :dots="true" class="row">
                    <div v-for="place in popularPlaces" :key="place.name" class="col-12">
                        <router-link :to="`/place/${place.name}`">
                            <div class="card bg-light h-25 mt-4">
                                <img :src="`${place.photoUrl}`" class="card-img" alt="No hay imagen">
                                <div class="card-body">
                                    <h5 class="card-title">{{place.name}}</h5>
                                    <p class="card-text"><small class="text-muted">{{place.destination}}</small></p>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </VueSlickCarousel>
            </div>
            <div class="py-5" v-if="isAuthenticated">
                <h1>Bodegas recomendadas según tus gustos</h1>
                <VueSlickCarousel :arrows="true" v-bind="settings" :dots="true" class="row" v-if="cbfPlaces.length > 0">
                    <div v-for="place in cbfPlaces" :key="place[0]" class="col-12">
                        <router-link :to="`/place/${place[0]}`">
                            <div class="card bg-light mt-4">
                                <img :src="`${place[1]}`" class="card-img" alt="No hay imagen">
                                <div class="card-body">
                                    <h5 class="card-title">{{place[0]}}</h5>
                                    <p class="card-text"><small class="text-muted">{{place[2]}}</small></p>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </VueSlickCarousel>
                <div class="alert alert-secondary mt-5" role="alert" v-else>
                    <p class="text-center">No se encontraron datos. Usa algún filtro o marca alguna bodega como favorita</p>
                </div>
            </div>
            <div class="py-5" v-if="isAuthenticated">
                <h1>Bodegas recomendadas según usuarios similares</h1>
                <VueSlickCarousel :arrows="true" v-bind="settings" :dots="true" class="row" v-if="cfPlaces.length > 0">
                    <div v-for="place in cfPlaces" :key="place.properties.name" class="col-12">
                        <router-link :to="`/place/${place.properties.name}`">
                            <div class="card bg-light mt-4">
                                <img :src="`${place.properties.photoUrl}`" class="card-img" alt="No hay imagen">
                                <div class="card-body">
                                    <h5 class="card-title">{{place.properties.name}}</h5>
                                    <p class="card-text"><small class="text-muted">{{place.properties.destination}}</small></p>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </VueSlickCarousel>
                <div class="alert alert-secondary mt-5" role="alert" v-else>
                    <p class="text-center">No se encontraron usuarios similares</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .card-img {
        height: 14rem !important;
    }

    a,
    a:hover,
    a:visited,
    a:active {
        color: black;
    }
</style>


<script>
    import VueSlickCarousel from 'vue-slick-carousel'
    import 'vue-slick-carousel/dist/vue-slick-carousel.css'
    // optional style for arrows & dots
    import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css'
    import {
        mapState
    } from 'vuex'

    export default {
        components: {
            VueSlickCarousel
        },
        data() {
            return {
                cfPlaces: [],
                cbfPlaces: [],
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
                settings_out: {
                    "dots": true,
                    "infinite": false,
                    "initialSlide": 0,
                    "speed": 500,
                    "slidesToShow": 3,
                    "slidesToScroll": 1,
                    "swipeToSlide": true,
                    "rows": 2
                }
            }
        },
        computed: {
            ...mapState([
                'isAuthenticated',
                'loggedInUser',
            ]),
        },
        async created() {
            if (this.isAuthenticated) {
                this.cfPlaces = await this.$api.getCfRecommendations(this.loggedInUser)
                this.cbfPlaces = await this.$api.getCbfRecommendations(this.loggedInUser)
            }
        },
        async asyncData({
            params,
            $api
        }) {
            const popularPlaces = await $api.getPopularCellars()
            return {
                popularPlaces
            }
        }
    }
</script>