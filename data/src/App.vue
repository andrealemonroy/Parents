<template>
  <section>
    <div v-if="login" class="center mt-60 font-20">
      <Row type="flex" justify="center">
        <Col>
          <br />
          <h1 class="mt-60">Ingresa para ver los datos</h1>
          <br />
          <br />
          <Form
            ref="loginForm"
            :model="loginForm"
            :rules="loginFormValidate"
            label-position="top"
          >
            <FormItem prop="user" label="Usuario">
              <Input v-model="loginForm.user"></Input>
            </FormItem>
            <FormItem prop="key" label="Clave">
              <Input type="password" v-model="loginForm.key"></Input>
            </FormItem>
            <Button :loading="showData" @click="access">Ingresar</Button>
          </Form>
        </Col>
      </Row>
    </div>
    <div v-else>
      <div class="header-info">
        <h1>Lista de familiares titulares</h1>
        <div class="total-info">
          <p>Total: {{ this.items.length }}</p>
          <Button :loading="updateLoader" @click="update">Actualizar</Button>
          <download-csv
            :data="excelDataChildsAndParents(items)"
            name="ReporteTotal.csv"
          >
            <Button>REPORTE TOTAL</Button>
          </download-csv>
          <div v-if="filterState" class="header-info">
            <download-csv
              :data="excelDataChildsAndParents(this.filtertotal)"
              class="mt-2"
            >
              <Button>REPORTE FILTRO</Button>
            </download-csv>
          </div>
        </div>
      </div>
      <br />
      <p>
        A continuación se muestra la lista de familiares tutelares:
      </p>
      <br />
      <br />
      <template>
        <!-- <download-csv :data="excelDataParents(items)">
              <Button>REPORTE TUTOR</Button>
            </download-csv> -->
        <div class="controls">
          <div>
            <label for="filter-range">Filtrar por fecha</label>
            <VueHotelDatepicker
              ref="filterRange"
              id="filter-range"
              :format="'MM-DD-YYYY'"
              :minDate="'15-12-2019'"
              :fromText="'De'"
              :toText="'a'"
              :confirmText="'Aplicar'"
              :weekList="['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']"
              :monthList="[
                'Ene.',
                'Feb.',
                'Mar.',
                'Abr.',
                'May.',
                'Jun.',
                'Jul.',
                'Ago.',
                'Sep.',
                'Oct.',
                'Nov.',
                'Dic.'
              ]"
              resetText="borrar"
              @confirm="confirm"
            >
            </VueHotelDatepicker>
            <b-button @click="filterByDate()">Filtrar</b-button>
            <b-button @click="clearFilterByDate()"
              ><span v-if="clearFilter">un momento...</span
              ><span v-else>Limpiar</span></b-button
            >
            <!-- <p>{{ this.dateFilter }}</p> -->
          </div>

          <div class="controls-filter">
            <b-form-group
              label="Filtrar por"
              label-size="sm"
              description="Se debe seleccionar al menos un filtro"
              class="mb-0"
            >
              <b-form-checkbox-group v-model="filterOn" class="mt-1">
                <b-form-checkbox value="identityDocumentNumber"
                  >Número de documento</b-form-checkbox
                >
                <b-form-checkbox value="names">Nombre</b-form-checkbox>
                <b-form-checkbox value="surname">Apellido</b-form-checkbox>
                <b-form-checkbox value="email">Correo</b-form-checkbox>
                <b-form-checkbox value="birthday"
                  >fecha de cumpleaños</b-form-checkbox
                >
              </b-form-checkbox-group>
            </b-form-group>

            <b-form-group class="mb-0">
              <b-input-group size="sm">
                <b-form-input
                  v-model="inputFilter"
                  type="search"
                  id="filterInput"
                  placeholder="Buscar"
                ></b-form-input>
              </b-input-group>
            </b-form-group>

            <b-input-group-append>
              <b-button @click="filterButton(inputFilter)">Filtrar</b-button>
              <b-button @click="deleteFilter">Borrar </b-button>
            </b-input-group-append>
          </div>
        </div>

        <div class="pagination mt-3">
          <b-form-group
            label="Por página"
            label-cols-sm="6"
            label-cols-md="4"
            label-cols-lg="3"
            label-align-sm="right"
            label-size="sm"
            label-for="perPageSelect"
            class="mb-0"
          >
            <b-form-select
              v-model="perPage"
              id="perPageSelect"
              size="sm"
              :options="pageOptions"
            ></b-form-select>
          </b-form-group>

          <div class="my-1">
            <b-pagination
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
              align="fill"
              size="sm"
              class="my-0"
            ></b-pagination>
          </div>
        </div>

        <b-table
          show-empty
          small
          stacked="md"
          :items="this.items"
          :fields="fields"
          :current-page="currentPage"
          :per-page="perPage"
          :filter="filter"
          :filterIncludedFields="filterOn"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :sort-direction="sortDirection"
          @filtered="onFiltered"
        >
          <template v-slot:cell(name)="row">
            {{ row.value }}
          </template>

          <template v-slot:cell(actions)="row">
            <b-button
              size="sm"
              @click="info(row.item, row.index, $event.target)"
              class="mr-1"
            >
              Ver hijos
            </b-button>
            <b-button size="sm" @click="row.toggleDetails">
              {{ row.detailsShowing ? "Cerrar" : "Mostrar" }} Contrato
              <!-- Contrato -->
            </b-button>
          </template>

          <template v-slot:row-details="row">
            <b-card>
              <!-- <div v-for="(value, key) in row" :key="key">
                <a :href='value.contract'>link del contrato</a>
              </div> -->
              <!-- <a :href="row.item.contract" target="_blank">Link del contrato</a> -->

              <iframe
                :src="row.item.contract"
                frameborder="0"
                style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100vh;"
                allowfullscreen
              ></iframe>
            </b-card>
          </template>
        </b-table>

        <b-modal
          :id="infoModal.id"
          :title="infoModal.title"
          ok-only
          @hide="resetInfoModal"
        >
          <div v-for="(value, key) in infoModal.content" :key="key">
            <p>Nombres: {{ value.names }}</p>
            <p>Apellidos: {{ value.surname }}</p>
            <p v-if="value.birthday">
              Fecha de nacimiento: {{ value.birthday.slice(0, 10) }}
            </p>
            <p>Parentesto: {{ value.relative }}</p>
            <hr />
          </div>
        </b-modal>
      </template>
    </div>
  </section>
</template>
<script>
import "./assets/css/style.css";
import * as Api from "../server/index";
import moment from "moment";
import Vue from "vue";
import JsonCSV from "vue-json-csv";
Vue.component("downloadCsv", JsonCSV);
import VueHotelDatepicker from "@northwalker/vue-hotel-datepicker";

export default {
  components: {
    VueHotelDatepicker
  },
  data() {
    return {
      dateFilter: {},
      updateLoader: false,
      inputFilter: null,
      filterState: false,
      filterTotal: null,
      login: true,
      parents: [],
      data: {},
      showData: false,
      notAdult: false,
      loginForm: {
        user: "",
        key: ""
      },
      loginFormValidate: {
        user: [
          {
            required: true,
            message: "Es requerido",
            trigger: "blur"
          }
        ],
        key: [
          {
            required: true,
            message: "Es requerido",
            trigger: "blur"
          }
        ]
      },
      items: [],
      fields: [
        {
          key: "fatherRandom",
          label: "Número de ticket",
          sortable: true,
          sortDirection: "desc"
        },
        {
          key: "date",
          label: "Fecha de visita",
          sortable: true,
          class: "text-center"
        },
        {
          key: "identityDocumentNumber",
          label: "Número de documento",
          sortable: true,
          class: "text-center"
        },
        {
          key: "names",
          label: "Nombre",
          sortable: true,
          class: "text-center"
        },
        {
          key: "surname",
          label: "Apellido",
          sortable: true,
          class: "text-center"
        },
        {
          key: "email",
          label: "Correo electrónico",
          sortable: true,
          class: "text-center"
        },
        {
          key: "phoneNumber",
          label: "Celular",
          sortable: true,
          class: "text-center"
        },
        {
          key: "birthday",
          label: "Fecha de nacimiento",
          sortable: true,
          class: "text-center"
        },
        {
          key: "visits",
          label: "Visitas",
          sortable: true,
          class: "text-center"
        },
        { key: "actions", label: "Contrato" }
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 5,
      pageOptions: [5, 10, 15],
      sortBy: "",
      sortDesc: false,
      sortDirection: "asc",
      filter: null,
      filterOn: [],
      infoModal: {
        id: "info-modal",
        title: "",
        content: ""
      },
      clearFilter: false
    };
  },
  methods: {
    info(item, index, button) {
      this.infoModal.title = `Hijo(s)`;
      // this.infoModal.content = JSON.stringify(item.childs, null, 2);
      this.infoModal.content = item.childs;
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    resetInfoModal() {
      this.infoModal.title = "";
      this.infoModal.content = "";
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.filtertotal = null;
      this.totalRows = filteredItems.length;
      this.filtertotal = filteredItems;
      console.log(filteredItems);
      this.currentPage = 1;
    },
    deleteFilter() {
      this.inputFilter = "";
      this.filter = "";
      this.filterState = false;
    },

    filterButton(inputFilter) {
      this.filter = inputFilter;
      console.log(this.filter);
      this.filterState = true;
    },

    excelDataParents(items) {
      let data = [];
      for (const item in items) {
        data.push({
          "Numero de ticket": items[item].fatherRandom,
          "Correo electrónico": items[item].email,
          Celular: items[item].phoneNumber,
          Nombre: items[item].names,
          Apellidos: items[item].surname,
          "Tiempo de registro(seg)": items[item].lastDate
        });
      }

      return data;
    },

    excelDataChildsAndParents(items) {
      let data = [];
      let fatherTicket;
      let dniParent;
      let nameParent;
      let surnameParent;
      let email;
      let phoneNumber;
      let registerTime;
      let fatherVisits;

      for (const item in items) {
        fatherTicket = items[item].fatherRandom;
        dniParent = items[item].identityDocumentNumber;
        nameParent = items[item].names;
        surnameParent = items[item].surname;
        email = items[item].email;
        phoneNumber = items[item].phoneNumber;
        registerTime = items[item].lastDate;
        fatherVisits = items[item].visits

        for (let i = 0; i < items[item].childs.length; i++) {
          if (items[item].childs[i].birthday == undefined) {
            data.push({
              "Numero de ticket": fatherTicket,
              "DNI tutor": dniParent,
              "Nombre de tutor": nameParent,
              "Apellidos de tutor": surnameParent,
              "Correo electrónico tutor": email,
              "Celular tutor": phoneNumber,
              "Tiempo de registro(seg)": registerTime,
              "Nombre de menor": items[item].childs[i].names,
              "Apellido de menor": items[item].childs[i].surname,
              Cumpleaños: "No se registró",
              Parentesco: items[item].childs[i].relative
            });
          } else {
            data.push({
              "Numero de ticket": fatherTicket,
              "DNI tutor": dniParent,
              "Nombre de tutor": nameParent,
              "Apellidos de tutor": surnameParent,
              "Correo electrónico tutor": email,
              "Celular tutor": phoneNumber,
              "Tiempo de registro(seg)": registerTime,
              "Visitas": fatherVisits,
              "Nombre de menor": items[item].childs[i].names,
              "Apellido de menor": items[item].childs[i].surname,
              Cumpleaños: items[item].childs[i].birthday.slice(0, 10),
              Parentesco: items[item].childs[i].relative
            });
          }
        }
      }

      return data;
    },
    deleteParentYoung(idParent) {
      Api.deleteParentYoung(idParent)
        .then(res => {
          this.$router.go();
          this.$Notice.info({
            title: "Eliminado con éxito"
          });
        })
        .catch(err => {
          this.$Notice.error({
            title: "Hubo un problema"
          });
        });
    },
    update() {
      this.updateLoader = true;
      this.items = "";
      Api.getAllParents()
        .then(res => {
          if (res.status == 200) {
            this.updateLoader = false;
            const payload = res.data;
            // this.items.push(payload);
            this.items = payload;

            this.login = false;
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].birthday = res.data[i].birthday.slice(0, 10);
              res.data[i].date = res.data[i].date.slice(0, 10);
            }
          }
          // const payload = res.data;
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.updateLoader = false;
        });
    },
    access() {
      this.showData = true;
      Api.getAllParents()
        .then(res => {
          if (res.status == 200) {
            this.showData = false;
            const payload = res.data;
            console.log(payload);
            // this.items.push(payload);
            this.items = payload;
            this.totalRows = this.items.length;
            if (
              this.loginForm.user == "iwaver" &&
              this.loginForm.key == "1234"
            ) {
              this.login = false;
              for (let i = 0; i < res.data.length; i++) {
                res.data[i].birthday = res.data[i].birthday.slice(0, 10);
                res.data[i].date = res.data[i].date.slice(0, 10);
              }
            }
          }
          // const payload = res.data;
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.showData = true;
        });
    },
    confirm(dateFil) {
      this.dateFilter = dateFil;
      console.log(this.dateFilter);
    },
    filterByDate() {
      let newItems = [];
      for (let i = 0; i < this.items.length; i++) {
        const date = moment(this.items[i].date).format("L");
        if (this.dateCheck(this.dateFilter.start, this.dateFilter.end, date)) {
          newItems.push(this.items[i]);
        }
      }
      console.log(newItems);
      this.items = [];
      this.totalRows = newItems.length;
      this.items = newItems;
      this.filtertotal = this.items;
      this.filterState = true;
      // Api.getParentsWithFilter(startDate, endDate).then(res => {
      //   console.log(res);
      // });
    },
    clearFilterByDate() {
      this.clearFilter = true;
      Api.getAllParents()
        .then(res => {
          if (res.status == 200) {
            this.filterState = false;
            this.clearFilter = false;
            this.$refs.filterRange.reset();
            this.items = [];
            this.showData = false;
            const payload = res.data;
            this.items = payload;
            this.totalRows = this.items.length;
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].birthday = res.data[i].birthday.slice(0, 10);
              res.data[i].date = res.data[i].date.slice(0, 10);
            }
          }
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.showData = true;
        });
    },
    dateCheck(from, to, check) {
      var fDate, lDate, cDate;
      fDate = Date.parse(from);
      lDate = Date.parse(to);
      cDate = Date.parse(check);

      if (cDate <= lDate && cDate >= fDate) {
        return true;
      }
      return false;
    }

    // computed: {
    //   sortOptions() {
    //     // Create an options list from our fields
    //     return this.fields
    //       .filter(f => f.sortable)
    //       .map(f => {
    //         return { text: f.label, value: f.key };
    //       });
    //   }
    // }
  },
  created() {
    // const payload = [...(await Api.getAllParents()).data];
    // this.items.push(payload);
    // this.items = payload;
    // this.items.push(this.parents)
    // this.parents.slice(0, 50);
    // console.log(this.parents);
    // console.log(this.items[0]);
  }
};
</script>

<style>
.header-info {
  display: flex;
  align-content: center;
  flex-direction: row;
  justify-content: space-between;
}

.total-info {
  display: flex;
  align-content: center;
  flex-direction: column;
  justify-content: center;
}

.controls {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.controls-filter {
  display: flex;
  align-content: flex-start;
  flex-direction: column;
  justify-content: left;
}

.pagination {
  display: flex;
  align-content: flex-start;
  flex-direction: row;
  justify-content: left;
}
</style>
