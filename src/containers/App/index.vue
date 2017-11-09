<template>
  <div id="app">
    <header></header>
    <div class="main-body">
      <div class="sidebar"></div>
      <div class="content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>
