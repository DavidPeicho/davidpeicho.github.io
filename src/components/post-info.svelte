<script context='module'>

  import Tag from '@components/tag';

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
  export let tags = [];

  const infos = [
    { icon: 'fa-calendar', text: formatDate(date) },
    { icon: 'fa-clock', text: `${readingTime} min read` }
  ]
</script>

<div class='container'>
  { #each infos as info }
    <div class='row'>
      <i class={'far ' + info.icon}></i>
      <span class='text'>{info.text}</span>
    </div>
  { /each }
</div>

<div>
  { #each tags as tag }
    <Tag tag={tag} />
  { /each }
</div>

<style>
  .container {
    position: relative;
    margin-bottom: 1rem;
    margin-top: 1rem;
    display: flex;
    justify-content: space-around;
    border-radius: 0.05rem;
    color: white;
    background-color: #ef495c;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.4);
    text-transform: initial;
  }

  .row {
    display: inline-block;
    padding: 10px;
  }

  .row .text {
    position: 'relative';
    margin: 'auto';
  }

  .row .icon-test {
    vertical-align: middle;
    font-size: 40px;
  }

</style>
