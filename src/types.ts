export interface LabelConfig {
  startNumber: number;
  totalLabels: number;
  rows: number;
  cols: number;
  
  // Dimensions in centimeters
  pageWidthCm: number; // 21.59 (letter)
  pageHeightCm: number; // 27.94 (letter)
  
  labelWidthCm: number; // 2.88
  labelHeightCm: number; // 2.69
  imageHeightCm: number; // 1.6
  
  marginTopCm: number; // 0.5
  marginBottomCm: number; // 0.5
  marginLeftCm: number; // 0.5
  marginRightCm: number; // 0.5
  
  // Spacing between labels
  spacingXCm: number; // 0
  spacingYCm: number; // 0
  
  // Styling
  fontSizePt: number; // 22
  fontFamily: string; // Arial / Helvetica
  fontColor: string; // #000000
  fontBold: boolean;
  
  prefix: string;
  suffix: string;
  padZeros: number; // e.g., 0 for no padding, 5 for 00123
  
  showBorder: boolean;
  borderWidthPt: number;
  borderColor: string;
  
  logoImageBase64: string;
  logoFileName: string;
  
  pageOrientation: 'portrait' | 'landscape';
}

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  config: Partial<LabelConfig>;
}
