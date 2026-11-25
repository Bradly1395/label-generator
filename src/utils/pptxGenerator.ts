import pptxgen from 'pptxgenjs';
import { LabelConfig } from '../types';
import { svgToPngBase64 } from './defaultLogo';

const CM_TO_INCH = 0.393700787;

export async function generatePptxFile(config: LabelConfig, onProgress?: (percent: number) => void): Promise<void> {
  const pres = new pptxgen();

  const isLandscape = config.pageOrientation === 'landscape';
  const widthInches = (isLandscape ? config.pageHeightCm : config.pageWidthCm) * CM_TO_INCH;
  const heightInches = (isLandscape ? config.pageWidthCm : config.pageHeightCm) * CM_TO_INCH;

  // Define layout to match exact physical dimensions
  pres.defineLayout({
    name: 'CUSTOM_PAGE',
    width: widthInches,
    height: heightInches,
  });
  pres.layout = 'CUSTOM_PAGE';

  const labelsPerPage = config.rows * config.cols;
  const totalPages = Math.ceil(config.totalLabels / labelsPerPage);

  // Prepare PNG image
  let imageBase64 = config.logoImageBase64;
  if (imageBase64.startsWith('data:image/svg')) {
    imageBase64 = await svgToPngBase64(imageBase64);
  }

  // Pre-calculate dimensional inch values
  const labelWidthIn = config.labelWidthCm * CM_TO_INCH;
  const labelHeightIn = config.labelHeightCm * CM_TO_INCH;
  const imageHeightIn = config.imageHeightCm * CM_TO_INCH;
  const textHeightIn = Math.max(0.1, (config.labelHeightCm - config.imageHeightCm) * CM_TO_INCH);

  const marginLeftIn = config.marginLeftCm * CM_TO_INCH;
  const marginTopIn = config.marginTopCm * CM_TO_INCH;
  const spacingXIn = config.spacingXCm * CM_TO_INCH;
  const spacingYIn = config.spacingYCm * CM_TO_INCH;

  const hexColor = (color: string) => color.replace('#', '').toUpperCase();
  const borderColor = hexColor(config.borderColor || '000000');
  const fontColor = hexColor(config.fontColor || '000000');

  let currentNumber = config.startNumber;

  for (let page = 0; page < totalPages; page++) {
    const slide = pres.addSlide();

    // Set slide background
    slide.background = { color: 'FFFFFF' };

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (currentNumber > config.startNumber + config.totalLabels - 1) {
          break;
        }

        const xPosIn = marginLeftIn + c * (labelWidthIn + spacingXIn);
        const yPosIn = marginTopIn + r * (labelHeightIn + spacingYIn);

        // 1. Label Container Background & Border Box
        if (config.showBorder) {
          slide.addShape(pres.ShapeType.rect, {
            x: xPosIn,
            y: yPosIn,
            w: labelWidthIn,
            h: labelHeightIn,
            fill: { color: 'FFFFFF' },
            line: {
              color: borderColor,
              width: Math.max(0.5, config.borderWidthPt || 0.8),
            },
          });
        } else {
          slide.addShape(pres.ShapeType.rect, {
            x: xPosIn,
            y: yPosIn,
            w: labelWidthIn,
            h: labelHeightIn,
            fill: { color: 'FFFFFF' },
            line: { color: 'FFFFFF', width: 0 },
          });
        }

        // 2. Logo Image (Top area of the label)
        if (imageBase64 && config.imageHeightCm > 0) {
          try {
            slide.addImage({
              data: imageBase64,
              x: xPosIn + 0.02,
              y: yPosIn + 0.02,
              w: Math.max(0.1, labelWidthIn - 0.04),
              h: Math.max(0.1, imageHeightIn - 0.03),
              sizing: {
                type: 'contain',
                w: Math.max(0.1, labelWidthIn - 0.04),
                h: Math.max(0.1, imageHeightIn - 0.03),
              },
            });
          } catch (e) {
            console.error('Failed to add image to slide', e);
          }
        }

        // 3. Formatted Number Text (Bottom area of the label)
        let numStr = currentNumber.toString();
        if (config.padZeros > 0) {
          numStr = numStr.padStart(config.padZeros, '0');
        }
        const fullText = `${config.prefix || ''}${numStr}${config.suffix || ''}`;

        const textYIn = yPosIn + imageHeightIn;

        slide.addText(fullText, {
          x: xPosIn,
          y: textYIn,
          w: labelWidthIn,
          h: textHeightIn,
          fontSize: config.fontSizePt || 20,
          fontFace: config.fontFamily || 'Arial',
          color: fontColor,
          bold: config.fontBold,
          align: 'center',
          valign: 'middle',
          margin: 0,
        });

        currentNumber++;
      }
    }

    if (onProgress) {
      onProgress(Math.round(((page + 1) / totalPages) * 100));
    }
  }

  const fileName = `etiquetas_${config.startNumber}_al_${config.startNumber + config.totalLabels - 1}.pptx`;
  await pres.writeFile({ fileName });
}
