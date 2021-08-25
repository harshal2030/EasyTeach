const commonBlue = '#22a7f0';
const commonGrey = '#6c7a89';
const commonBackground = '#edf0f2';
const statusbarColor = '#19b5fe';
const flatRed = '#d91e18';
const eucalyptusGreen = '#26a65b';

const greenWithAlpha = (alpha: number): string => {
  if (alpha > 1 || alpha < 0) {
    return eucalyptusGreen;
  }

  return `rgba(38, 166, 91, ${alpha})`;
};

const greyWithAlpha = (alpha: number): string => {
  if (alpha > 1 || alpha < 0) {
    return commonGrey;
  }

  return `rgba(108,122,137, ${alpha})`;
};

export {
  commonBlue,
  commonGrey,
  commonBackground,
  statusbarColor,
  flatRed,
  eucalyptusGreen,
  greyWithAlpha,
  greenWithAlpha,
};
