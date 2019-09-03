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
    const date = dateRaw ? new Date(dateRaw) : new Date();
    const m = MONTHS[date.getMonth()];
    const d = date.getDate();
    const y = date.getFullYear();
    return `${m} ${d}, ${y}`;
  }

  /**
   * Create a list of info [date, readingTime] with icon and text per entry.
   *
   * This is used to simplify the Svelte loop.
   *
   * @return {Object[]} Array of entry (text + icon)
   */
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

  /**
   * This component displays information about a post / project.
   * It's made to display a date and a reading time, nothing else.
   */

  /**
   * The date to display. If not provided, it will take `now` as a date.
   *
   * In general, you should format your string as follow: `21 March 2019`.
   *
   * @type {string}
   */
  export let date = null;

  /**
   * The blog post reading time. Defaults to `10`.
   *
   * @type {number}
   */
  export let readingTime = 10;

  /**
   * Extra style to apply to the DOM element.
   *
   * @type {string}
   */
  export let style = '';

  $: infos = createInfo({ date, readingTime });

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
