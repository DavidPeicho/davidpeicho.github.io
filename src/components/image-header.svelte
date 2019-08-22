<script context='module'>
  function getImageStyle(image) {
    return `background: url(${image})`;
  }

</script>

<script>
  export let image = null;
</script>

<div class='container'>
  <div class='image' style={getImageStyle(image)}></div>
  <div class='overlay'>
    <slot></slot>
  </div>
</div>

<style>

  .container {
    position: relative;
    width: 100%;
    height: 500px;
    margin: auto;
  }

  .container .image {
    position: relative;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .container .image::after {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    content: '';
    background: #42566480 no-repeat 50% 100%;
  }

  .container .overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    align-content: center;
  }

</style>
