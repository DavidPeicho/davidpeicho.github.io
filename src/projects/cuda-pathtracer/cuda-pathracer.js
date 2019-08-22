import { Tags } from '$config';
import thumbnail from './thumbnail.jpg';

export const Metadata = {
  tags: [ Tags.ComputerGraphics ],
  url: 'https://github.com/DavidPeicho/cuda-pathtracer',
  thumbnail,
  title: 'CUDA Pathtracer',
  description: `
    Simple Pathtracer written in CUDA. It supports Texturing, Normal Mapping,
    IBL, and Depth Of Field.
    It's a quick project to try out CUDA.
  `,
  date: 2018,
};
