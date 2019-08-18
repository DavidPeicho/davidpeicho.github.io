<script context='module'>

  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  function formatDate(dateRaw) {
    const date = new Date(dateRaw);
    const m = MONTHS[date.getMonth()];
    const d = date.getDate();
    const y = date.getFullYear();
    return `${m} ${d}, ${y}`;
  }

</script>

<script>
  export let date = new Date();
  export let readingTime = 15;

  const infos = [
    { icon: '', text: formatDate(date) },
    { icon: '', text: `${readingTime} min read` }
  ]
</script>

<div class='container'>
  { #each infos as info }
    <div class='info-row'>{info.text}</div>
  { /each }
</div>

<style>
  .container {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 1rem;
    padding: 0.5rem;
    text-align: left;
    border-radius: 0.25rem;
    color: white;
    background-color: #F07E74;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.4);
    text-transform: initial;
  }

  .info-row {
    position: 'relative';
    margin: 'auto';
  }
</style>
