<script context='module'>

  import Icon from '@components/icon';
  import Tag from '@components/tag';

  import { SVGCalendar, SVGGlasses } from '@utils/icons';

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

  export function createInfo({ date, readingTime }) {
    const info = [];
    if (date) {
      const icon = SVGCalendar;
      const text = formatDate(date);
      info.push({ icon, id: 'date', text });
    }
    if (readingTime) {
      const icon = SVGGlasses;
      const text = `${readingTime} min read`;
      info.push({ icon, id: 'readingTime', text });
    }
    return info;
  }

</script>

<script>

  export let date = new Date();
  export let readingTime = 15;

  export let style = '';

  const infos = createInfo({ date, readingTime });

</script>

<div class='container' style={style}>
  { #each infos as info }
    <div class='row'>
      <Icon width={15} height={15} {...(info.icon)} style='margin-right: 0.25rem;'/>
      <span class='text'>{info.text}</span>
    </div>
  { /each }
</div>

<style>
  .container {
    position: relative;
    display: flex;
    justify-content: space-around;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .row .text {
    position: 'relative';
    margin: 'auto';
  }

</style>
