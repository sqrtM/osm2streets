<script lang="ts">
  import init from "osm2streets-js";
  import { onMount } from "svelte";
  import AppSwitcher from "../AppSwitcher.svelte";
  import { Layout, Map } from "../osm2streets-svelte";
  import ImportControls from "../osm2streets-svelte/import/ImportControls.svelte";
  import MainLayers from "../osm2streets-svelte/layers/MainLayers.svelte";
  import EditWayControls from "./EditWayControls.svelte";

  onMount(async () => {
    await init();
  });
</script>

<Layout>
  <div slot="left">
    <h1>osm2streets lane editor</h1>
    <AppSwitcher />
    <p>
      Improve OSM lane tagging with
      <a href="https://github.com/a-b-street/osm2streets" target="_blank"
        >osm2streets</a
      >.
    </p>
    <hr />

    <ImportControls />
    <hr />

    <EditWayControls />
    <hr />

    <div>
      <strong>Warnings:</strong>
      <ul>
        <li><strong>This tool is an early experiment</strong></li>
        <li>Don't use this tool without understanding OSM tagging</li>
        <li>Be careful around sidepaths, footways, and dual carriageways</li>
        <li>Don't edit a way that's partly clipped</li>
      </ul>
    </div>
  </div>
  <div slot="main">
    <Map>
      <div style:display="none"><MainLayers /></div>
    </Map>
  </div>
</Layout>
