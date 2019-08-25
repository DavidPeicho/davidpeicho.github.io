<script context="module">

  import ImageHeader from '@components/image-header';

  function getJobEntryStyle(i) {
    return i % 2 === 0 ? 'flex-direction: row' : 'flex-direction: reverse-row;';
  }

  function getJobElementStyle(i) {
    if (i % 2 !== 0) {
      return `
        flex-direction: row-reverse;
        text-align: right;
        border-right: 2px solid #939393;
        border-left: none;
      `;
    }
    return '';
  }

</script>

<script>

  /**
   * Company resume.
   *
   * @typedef {Object} Company
   * @property {string} company - Name of the company
   * @property {string} date - Years active in the company
   * @property {string} title - Work title in the company
   */

  /** PROPS */

  /**
   * A list of company making up your resume.
   *
   * @type {Company[]}
   */
  export let resume = [];

</script>

<ImageHeader image='images/me.jpg' opacity={0.8}>
  <div class='header'>
    <h1 class='textshadow'>David Peicho</h1>
    <h2 class='textshadow'>Research Scientist</h2>
    <h3 class='softtextshadow'>@ Siemens Healthineers</h3>
  </div>
</ImageHeader>

<!-- Applies auto-centering, and inject the `about` page markdown. -->
<div class='post-content'><slot /></div>

<!-- Displays a list of places you have worked at. -->
<div class='experience'>
  <div class='job-timeline'>
    { #each resume as company, i }
      <div class='entry' style={getJobEntryStyle(i)}>
        <img class='element' />
        <div class='element' style={getJobElementStyle(i)}>
          <p>{company.date}</p>
          <p>{company.name}</p>
          <p>{company.title}</p>
        </div>
      </div>
    { /each }
  </div>
</div>

<style>

  .header {
    width: 75%;
    float: right;
    padding-top: 1rem;
  }

  .header h1, .header h2 {
    color: white;
    margin: 0;
  }

  .header h2 {
    margin: 2rem 0 0 0;
    font-weight: 400;
  }

  .header h3 {
    color: #ef495c;
    margin: 0.25rem 0 0 0;
    font-weight: 300
  }

  .experience {
    width: 100%;
    background-color: #f1f0f0;
  }

  .job-timeline {
    width: 100%;
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: auto;
  }

  .job-timeline .entry {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    margin-top: 2rem;
  }

  .entry .element {
    flex-grow: 1;
    margin: auto;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

</style>
