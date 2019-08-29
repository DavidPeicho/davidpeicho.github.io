<script context='module'>

  import { Colors } from '$constants';

  import Icon from '@components/icon';
  import { SVGMapMarker } from '@utils/icons';

  /**
   * Computes the inline style of an entire entry (a row).
   *
   * @param {number} i - Current row index, used to style either left or right
   * @return {string} The inlined style
   */
  function getJobEntryStyle(i) {
    return i % 2 === 0 ? 'flex-direction: row' : 'flex-direction: row-reverse;';
  }

  /**
   * Computes the inline style of a row element, either for a company logo
   * or for the text.
   *
   * @param {number} i - Current row index, used to style either left or right
   * @return {string} The inlined style
   */
  function getJobElementStyle(i) {
    const color = Colors.Secondary;
    if (i % 2 !== 0) {
      return `
        text-align: right;
        border-right: 2px solid ${color};
      `;
    }
    return `border-left: 2px solid ${color};`;
  }

  /**
   * Computes the inline style of the company logo.
   *
   * @param {number} i - Current row index, used to style either left or right
   * @return {string} The inlined style
   */
  function getLogoStyle(i) { return `text-align: ${i % 2 ? 'left' : 'right'};` }

</script>

<script>

  /**
   * This component builds a list of places you have worked at, under the form:
   *   - Company A: when? title? where?
   *   - Company B: when? title? where?
   *   - ...
   *
   * This component should work both on desktop and mobile.
   */

  /**
   * Company resume.
   *
   * @typedef {Object} Company
   * @property {string} company - Name of the company
   * @property {string} date - Approximative active range of years in the company
   * @property {string} title - Work title in the company
   */

  /** PROPS */

  /**
   * A list of company you worked at, making up your resume.
   *
   * @type {Company[]}
   */
  export let resume = [];

</script>

<div class='job-timeline'>
{ #each resume as company, i }
  <div class='entry' style={getJobEntryStyle(i)}>
    <div class='element' style={getLogoStyle(i)}>
      <img src={company.logo} alt={company.company + ' logo'} />
    </div>
    <div class='element text' style={getJobElementStyle(i)}>
      <p class='bold'>{company.date}</p>
      <p class='bold'>{company.company}</p>
      <p class='light'>{company.title}</p>
      <!-- Author can provide a location for each experience. -->
      { #if company.location }
        <div style='margin-top: 0.75rem;'>
          <Icon width=15 height=15 {...SVGMapMarker} />
          <span>{company.location}</span>
        </div>
      { /if }
    </div>
  </div>
{ /each }
</div>

<style>

  .job-timeline {
    display: flex;
    max-width: 32rem;
    margin: auto;
    flex-direction: column;
    padding: 0 0.5rem 0 0.5rem;
  }

  .job-timeline .entry {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    margin-bottom: 2rem;
  }

  .entry .element {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .entry img { max-height: 100px; }

  .entry .text { text-align: left; }

  .text p { margin: 0; }

  .text .bold { font-weight: 700; }

  .text .light { font-weight: 300; }

</style>