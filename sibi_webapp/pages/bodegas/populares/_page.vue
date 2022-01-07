<template>
    <div>
        <navbar-filter style="float:left" :winetypes="winetypes" :destinations="destinations" :dos="dos" @filter="filterquery" />
        <div class="container">
            <h1>Bodegas populares</h1>
            <div v-if="popularPlaces.bodegas.length>0">
                <div class="row">
                    <div v-for="place in popularPlaces.bodegas" :key="place.name" class="col-lg-4 col-md-6 col-sm-12">
                        <router-link :to="`/place/${place.name}`">
                            <div class="card bg-light my-3">
                                <img :src="`${place.photoUrl}`" class="card-img" alt="No hay imagen o no se pudo cargar">
                                <div class="card-body">
                                    <h5 class="card-title">{{place.name}}</h5>
                                    <p class="card-text"><small class="text-muted">{{place.destination}}</small></p>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </div>
                <div class="row justify-content-center d-flex mt-3">
                    <nav>
                        <ul class="pagination">
                            <li class="page-item">
                                <router-link class="page-link" v-if="this.$route.params.page > 1" :to="`/bodegas/populares/1${urlSuffix}`">&laquo;</router-link>
                            </li>
                            <li class="page-item">
                                <router-link class="page-link" v-if="this.$route.params.page > 1" :to="`/bodegas/populares/${this.$route.params.page-1}${urlSuffix}`">{{this.$route.params.page-1}}</router-link>
                            </li>
                            <li class="page-item">
                                <span class="page-link">{{this.$route.params.page}}</span>
                            </li>
                            <li class="page-item">
                                <router-link class="page-link" v-if="this.$route.params.page < Math.floor(popularPlaces.nResults)/18" :to="`/bodegas/populares/${Number(this.$route.params.page)+1}${urlSuffix}`">{{Number(this.$route.params.page)+1}}</router-link>
                            </li>
                            <li class="page-item">
                                <router-link class="page-link" v-if="this.$route.params.page < Math.floor(popularPlaces.nResults)/18" :to="`/bodegas/populares/${Number(Math.floor(popularPlaces.nResults)/18)}${urlSuffix}`"> &raquo; </router-link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            <Notification message="No se encontró ningún sitio con los filtros aplicados" v-else />
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

    .card:hover img {
        transform: rotate(3deg);
        transition: all .1s linear;
    }
</style>

<script>
    import NavbarFilter from '../../../components/NavbarFilter.vue'
    import Notification from '../../../components/Notification.vue'
    import {
        mapState
    } from 'vuex'
    export default {
        components: {
            NavbarFilter,
            Notification,
        },
        methods: {
            async filterquery(dest, winetype, doo) {
                this.$router.push({
                    path: '/bodegas/populares/1?region=' + dest + '&vino=' + winetype + '&do=' + doo
                })
                this.popularPlaces = await this.$api.getPopularCellarsFiltered(1, dest, winetype, doo)
                if (this.isAuthenticated) {
                    this.$api.setLastFilter(this.loggedInUser, dest, winetype, doo)
                }
            }
        },
        computed: {
            ...mapState([
                'isAuthenticated',
                'loggedInUser',
            ])
        },
        async asyncData({
            route,
            params,
            $api
        }) {
            let popularPlaces
            let destinations = await $api.getDestinations()
            let winetypes = await $api.getWineTypes()
            let dos = await $api.getDOs()
            let urlSuffix = ''
            if (Object.entries(route.query).length == 0) {
                popularPlaces = await $api.getPopularCellarsFilter(route.params.page)
            } else {
                popularPlaces = await $api.getPopularCellarsFiltered(1, route.query.region, route.query.vino, route.query.do)
                urlSuffix = '?region=' + route.query.region + '&vino=' + route.query.vino + '&do=' + route.query.do
            }
            return {
                popularPlaces,
                destinations,
                winetypes,
                dos,
                urlSuffix
            }
        }
    }
</script>