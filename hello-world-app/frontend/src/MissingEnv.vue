<template>
  <div>
    <v-app>
      <v-card>
        <v-card-title primary-title>
            <h3 class="headline mb-0" >Missing Environment Variables</h3>
        </v-card-title>
        <v-card-text>
          <span>The following environment variables need to be set in your backend application running on {{backend}}.</span>
          <v-list two-line>
            <template v-for="(item,index) in missing">
              <v-list-tile :key="index">
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.field"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.desc"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'MissingEnv',
  props : {
    backend : {
      type : String,
      default : process.env.VUE_APP_HANA_APP_BACKEND
    },
    missing : {
      type : Array,
      default () {[];}
    }
  },
  data () {
    return {};
  },
  components: { },
  methods : { }
};
</script>