import { Tags } from '$config';
import thumbnail from './thumbnail.jpg';

export const Metadata = {
  tags: [ Tags.VR, Tags.ComputerGraphics ],
  url: 'https://github.com/artflow-vr/artflow',
  thumbnail,
  title: 'ArtFlow VR',
  date: 2018,
  description: `
    ArtFlow is a WebVR experience in which users can draw and build a world
    in the same way they would do it in Tilt Brush or Quill.
    ArtFlow was made to finalize my Master's Degree at EPITA.
  `,
  priority: 1,
  videoLink: 'https://www.youtube.com/watch?v=QtjKiANf6GY'
};
