<script context='module'>

    import { User } from '$blog';

    import Icon from '@components/icon';

    import { SVGEmail, SVGGithub, SVGLinkedin, SVGTwitter } from '@utils/icons';

    const SocialToData = {
      github: { baseURL: 'https://github.com', icon: SVGGithub },
      twitter: { baseURL: 'https://twitter.com', icon: SVGTwitter },
      linkedin: { baseURL: 'https://www.linkedin.com/in', icon: SVGLinkedin }
    };

    export function createSocialLinks() {
      const list = [];
      const social = User.social || {};

      if (User.email) {
        list.push({
          icon: SVGEmail, url: ('mailto:' + User.email), text: User.email,
          target: ''
        });
      }

      // Pushes all social contact links.
      for (const name in social) {
        const data = SocialToData[name];
        if (data) {
          const url = `${data.baseURL}/${social[name]}`;
          list.push({ icon: data.icon, url, text: social[name] });
        }
      }

      return list;
  }

</script>

<script>

  let contactList = createSocialLinks();

</script>

<div class='footer'>
  <div class='contact'>
    <h1>Contact</h1>
    <div>
      { #each contactList as contact, i }
        <div class='contact-entry' style={i === 0 ? 'margin: 0 0 0 0;' : ''}>
          <Icon
            style='vertical-align: middle;'
            width=25 height=25
            {...contact.icon}
          />
          <a
            href={contact.url}
            target={contact.target !== undefined ? contact.target : '_blank'}>
              {contact.text}
          </a>
        </div>
      { /each }
    </div>
  </div>
</div>

<style>

  .footer {
    width: 100%;
    background-color: #f1f0f0;
  }

  .footer .contact {
    max-width: 600px;
    padding: 3rem 0 3rem 0;
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
  }

  .contact h1 {
    margin: 0;
  }

  .contact .contact-entry {
    margin: 0.75rem 0 0 0;
  }

  .contact-entry:hover {
    cursor: pointer;
    color: blue;
  }

  .contact-entry a {
    text-decoration: none;
    margin-left: 0.5rem;
  }

  @media (max-width: 600px) {

    .contact {
      flex-direction: column;
    }

  }

</style>
