<template>
  <router-view/>
</template>

<style lang="scss">
body,div,h1,h2,h3,h4,h5,h6,p,span,ol,ul,li,dl,dt,dd,input,form,select,form,input,textarea{
    margin:0;
    padding:0;
    font-family:"Microsoft YaHei UI";
}
li{ list-style:none}
img{ border:none; display:block;}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
