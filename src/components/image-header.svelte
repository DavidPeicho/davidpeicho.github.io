<script context='module'>
  function getImageStyle(image) {
    return `background: url(${image})`;
  }

  function getBackgroundStyle(opacity = 0.2) {
    return `background: rgb(29, 38, 43, ${opacity})`;
  }

</script>

<script>
  export let image = null;

  export let opacity = 0.7;

  export let style = '';
</script>

<div class='container' style={style}>
  <div class='image' style={getImageStyle(image)}></div>
  <div class='overlay' style={getBackgroundStyle(opacity)}>
    <div class='content'><slot></slot></div>
  </div>
</div>

<style>

  .container {
    position: relative;
    width: 100%;
    height: 100%;
    margin: auto;
  }

  .container .image {
    position: relative;
    height: 100%;
    background-size: cover !important;
    background-repeat: no-repeat !important;
    background-position: center center !important;
  }

  .container .overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    align-content: center;
  }

  .overlay .content {
    width: 90%;
    margin: auto;
    text-align: center;
  }

</style>
