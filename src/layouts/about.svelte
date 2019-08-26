<script context="module">

  import ImageHeader from '@components/image-header';
  import Icon from '@components/icon';
  import {
    SVGGithub, SVGLinkedin, SVGTwitter, SVGMapMarker
  } from '@utils/icons';

  import { Colors } from '$constants';
  import Blog from '$blog';

  function createSocialLinks() {
    const social = [];
    if (!Blog.social) { return social; }
    const github = Blog.social.github;
    const linkedin = Blog.social.linkedin;
    const twitter = Blog.social.twitter;
    if (github) {
      social.push({
        url: `https://github.com/${github}`,
        icon: SVGGithub
      });
    }
    if (twitter) {
      social.push({
        url: `https://twitter.com/${twitter}`,
        icon: SVGTwitter
      });
    }
    if (linkedin) {
      social.push({
        url: `https://www.linkedin.com/in/${linkedin}`,
        icon: SVGLinkedin
      });
    }
    return social;
  }

  function getJobEntryStyle(i) {
    return i % 2 === 0 ? 'flex-direction: row' : 'flex-direction: row-reverse;';
  }

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

  function getLogoStyle(i) {
    return `text-align: ${i % 2 ? 'left' : 'right'};`
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

  const socials = createSocialLinks();
</script>

<ImageHeader image='images/me.jpg' opacity={0.8}>
  <!-- Blog author information: name, title, company, etc.. -->
  <div class='header'>
    <h1 class='textshadow'>David Peicho</h1>
    <h2 class='textshadow'>Research Scientist</h2>
    <h3 class='softtextshadow'>@ Siemens Healthineers</h3>
    <!-- Current Location. -->
    <div class='location'>
      <Icon width=25 height=25 path={SVGMapMarker} />
      <span>{Blog.location}</span>
    </div>
  </div>
</ImageHeader>

<!-- Injects user markdown. -->
<div class='post-content'>
  <div class='social'>
    { #each socials as social }
      <a href={social.url} target='_blank'><Icon path={social.icon} /></a>
    { /each }
  </div>
  <slot />
</div>

<!-- Displays a list of places you have worked at. -->
<div class='experience'>
  <h2 class='post-content'>Experience</h2>
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
              <Icon width=15 height=15 path={SVGMapMarker} />
              <span>{company.location}</span>
            </div>
          { /if }
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
    margin: 1.5rem 0 0 0;
    font-weight: 400;
  }

  .header h3 {
    color: #ef495c;
    margin: 0.25rem 0 0 0;
    font-weight: 300
  }

  .header .location {
    display: inline-flex;
    color: white;
    margin: 2rem 0 0 0;
  }

  .social {
    position: fixed;
    display: flex;
    flex-direction: column;
    transform: translateX(-250%);
  }

  .social a {
    transition: color .3s ease,color .3s ease;
  }

  .social a:hover {
    color: #ef495c;
  }

  .experience {
    width: 100%;
    background-color: #f1f0f0;
  }

  .experience h2 {
    padding-top: 3.5rem;
  }

  .job-timeline {
    display: flex;
    width: 100%;
    max-width: 500px;
    margin: auto;
    margin-top: 1rem;
    flex-direction: column;
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

  .entry img { max-height: 100px; }

  .entry .text { text-align: left; }

  .text p { margin: 0; }

  .text .bold { font-weight: 700; }

  .text .light { font-weight: 300; }

  @media (max-width: 1100px) {

    .social {
      position: relative;
      width: 60%;
      margin: auto;
      margin-top: 3rem;
      flex-direction: row;
      justify-content: space-evenly;
      transform: initial;
    }

  }

</style>
