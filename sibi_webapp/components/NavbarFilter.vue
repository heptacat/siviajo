<template>
    <ul class="nav flex-column sticky-bottom mt-5 ml-5">
        <h3 class="h3 mb-1">Filtros
            <hr />
        </h3>
        <form>
            <li class="nav-item">
                <div class="form-group">
                    <label for="optionregion">Región</label>
                    <select v-model="selecteddest" class="form-control" id="optionregion">
                        <option v-for="destination in destinations" :key="destination">
                            {{destination}}
                        </option>
                    </select>
                </div>
                <hr>
            </li>
            <li class="nav-item">
                <div class="form-group">
                    <label for="optionwine">Tipo de vino</label>
                    <select v-model="selectedwinetype" class="form-control" id="optionwine">
                        <option v-for="type in winetypes" :key="type">
                            {{type}}
                        </option>
                    </select>
                </div>
                <hr>
            </li>
            <li class="nav-item">
                <div class="form-group">
                    <label for="optiondo">Denominación de Origen</label>
                    <select v-model="selecteddo" class="form-control" id="optiondo">
                        <option v-for="dorigin in dos" :key="dorigin">
                            {{dorigin}}
                        </option>
                    </select>
                </div>
                <hr>
            </li>
            <li class="nav-item">
                <input type="button" class="btn btn-outline-secondary w-100" @click='filterr()' value="Filtrar">
            </li>
        </form>
    </ul>
</template>


<script>
    export default {
        props: ['winetypes', 'destinations', 'dos'],
        methods: {
            filterr() {
                if (this.selecteddest != '' && this.selectedwinetype != '' && this.selecteddo != '') {
                    this.$emit('filter', this.selecteddest, this.selectedwinetype, this.selecteddo)
                } else {
                    alert("Cubre todos los filtros")
                }
            }
        },
        data() {
            return {
                selecteddest: '',
                selectedwinetype: '',
                selecteddo: '',
            }
        }
    }
</script>