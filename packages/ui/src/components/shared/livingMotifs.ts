/**
 * World-wise living ground watermark motifs.
 *
 * Each of Gurudevi's 11 worlds carries an authentic, subtle material sign
 * pressed into its tactile ground as an embossed watermark.
 *
 * Design Invariant: Simpler Silence.
 * Watermarks rest in the periphery and horizons (leaving reading and form fields
 * tranquil and uncluttered). Low opacity (0.18–0.35) and dual-tone relief
 * (shadow + highlight) give gentle physical tooth without harsh flat RGB glare.
 *
 * Platform-neutral: SVG path data in a canonical 1440 × 900 coordinate space.
 */

import type { WorldId } from '../../theme/types';

export interface MotifPath {
  readonly d: string;
  readonly width: number;
}

export interface WorldMotifDefinition {
  readonly id: WorldId;
  readonly paths: readonly MotifPath[];
}

export const LIVING_MOTIFS: Readonly<Record<WorldId, WorldMotifDefinition>> = {
  // 1. Kele (Forest canopy - Nature): Vascular leaf spine & lateral canopy veins
  kele: {
    id: 'kele',
    paths: [
      { d: 'M-40 960 Q300 660 480 0', width: 3.2 },
      { d: 'M40 880 Q240 760 520 790', width: 2.0 },
      { d: 'M120 780 Q320 660 620 680', width: 2.0 },
      { d: 'M190 680 Q380 560 680 570', width: 2.0 },
      { d: 'M260 560 Q440 440 730 450', width: 2.0 },
      { d: 'M330 420 Q480 320 760 320', width: 2.0 },
      { d: 'M390 280 Q510 200 750 190', width: 2.0 },
      { d: 'M440 140 Q530 80 720 70', width: 2.0 },
      { d: 'M1520 400 Q1050 350 850 -50', width: 2.6 },
      { d: 'M1420 480 Q1180 440 980 520', width: 1.8 },
      { d: 'M1320 380 Q1120 320 900 370', width: 1.8 },
      { d: 'M1220 280 Q1050 210 840 240', width: 1.8 },
      { d: 'M1100 170 Q960 110 800 120', width: 1.8 },
    ],
  },

  // 2. Sanctuary (Vellum & lamp light - Quiet): Sacred oil lamp flame filament & gentle hearth aura
  sanctuary: {
    id: 'sanctuary',
    paths: [
      { d: 'M720 920 C720 740, 680 560, 720 360 C740 480, 770 600, 720 920', width: 2.2 },
      { d: 'M720 910 C640 780, 600 640, 660 500', width: 1.6 },
      { d: 'M720 910 C800 780, 840 640, 780 500', width: 1.6 },
      { d: 'M460 880 Q720 840 980 880', width: 2.2 },
      { d: 'M540 910 Q720 880 900 910', width: 1.6 },
      { d: 'M320 940 Q720 800 1120 940', width: 1.4 },
    ],
  },

  // 3. Wewa (Tank water & moonlight - Quiet): Calm concentric ripples & moonlit swells
  wewa: {
    id: 'wewa',
    paths: [
      { d: 'M-80 720 Q720 620 1520 720', width: 2.2 },
      { d: 'M-40 780 Q720 690 1480 780', width: 2.0 },
      { d: 'M60 840 Q720 760 1380 840', width: 1.8 },
      { d: 'M200 900 Q720 830 1240 900', width: 1.6 },
      { d: 'M120 620 Q520 570 920 630', width: 1.4 },
      { d: 'M480 560 Q720 530 960 560', width: 1.2 },
    ],
  },

  // 4. Tea (Rows of tea on misty hills - Nature): Highland terraced contours & mist lines
  tea: {
    id: 'tea',
    paths: [
      { d: 'M-60 520 Q380 470 820 550 Q1180 610 1500 530', width: 2.2 },
      { d: 'M-40 640 Q420 570 880 650 Q1240 710 1480 640', width: 2.0 },
      { d: 'M-20 760 Q460 690 920 760 Q1280 800 1460 750', width: 1.8 },
      { d: 'M40 860 Q520 800 960 860 Q1320 890 1440 850', width: 1.6 },
      { d: 'M-80 380 Q320 320 780 400 Q1120 440 1520 360', width: 1.4 },
    ],
  },

  // 5. Kandyan (Lime plaster & mural earth - Cultural): Sinuous Liyawela vine scroll in the margin
  kandyan: {
    id: 'kandyan',
    paths: [
      { d: 'M120 960 C80 820, 180 720, 130 580 C80 440, 180 320, 120 160 C90 80, 140 0, 110 -60', width: 2.6 },
      { d: 'M130 580 C200 550, 240 600, 210 640 C180 670, 140 640, 150 610', width: 1.8 },
      { d: 'M120 400 C190 370, 230 420, 200 460 C170 490, 130 460, 140 430', width: 1.8 },
      { d: 'M140 760 C210 730, 250 780, 220 820 C190 850, 150 820, 160 790', width: 1.8 },
      { d: 'M120 220 C190 190, 230 240, 200 280 C170 310, 130 280, 140 250', width: 1.8 },
      { d: 'M60 -40 L60 940', width: 1.2 },
    ],
  },

  // 6. Angampora (Packed earth & brass - Cultural): Grounded architectural chevron & stone lines
  angampora: {
    id: 'angampora',
    paths: [
      { d: 'M180 940 L720 720 L1260 940', width: 2.4 },
      { d: 'M280 940 L720 770 L1160 940', width: 1.8 },
      { d: 'M380 940 L720 820 L1060 940', width: 1.4 },
      { d: 'M180 200 L180 940', width: 1.6 },
      { d: 'M1260 200 L1260 940', width: 1.6 },
      { d: 'M140 420 L1300 420', width: 1.2 },
    ],
  },

  // 7. Perahera (Festival night - Cultural): Rhythmic percussion wave cadence & ceremonial festoons
  perahera: {
    id: 'perahera',
    paths: [
      { d: 'M-60 780 Q240 680 540 780 T1140 780 T1500 780', width: 2.2 },
      { d: 'M-40 840 Q260 750 560 840 T1160 840 T1480 840', width: 1.8 },
      { d: 'M-80 720 Q220 610 520 720 T1120 720 T1520 720', width: 1.8 },
      { d: 'M240 60 Q720 180 1200 60', width: 1.6 },
      { d: 'M360 80 Q720 180 1080 80', width: 1.2 },
    ],
  },

  // 8. Ratna (Ivory & sapphire - Quiet): Ceylon Beeralu lace filigree scallops
  ratna: {
    id: 'ratna',
    paths: [
      { d: 'M-20 140 Q80 180 180 140 Q280 180 380 140 Q480 180 580 140 Q680 180 780 140 Q880 180 980 140 Q1080 180 1180 140 Q1280 180 1380 140 Q1480 180 1560 140', width: 1.6 },
      { d: 'M30 180 Q130 210 230 180 Q330 210 430 180 Q530 210 630 180 Q730 210 830 180 Q930 210 1030 180 Q1130 210 1230 180 Q1330 210 1430 180', width: 1.2 },
      { d: 'M200 860 Q720 800 1240 860', width: 1.6 },
      { d: 'M280 890 Q720 840 1160 890', width: 1.2 },
    ],
  },

  // 9. Rosa (Rose petals & jasmine - Bloom): Overlapping soft dawn flower petals
  rosa: {
    id: 'rosa',
    paths: [
      { d: 'M720 920 C580 820, 480 660, 560 520 C640 580, 700 740, 720 920', width: 2.0 },
      { d: 'M720 920 C860 820, 960 660, 880 520 C800 580, 740 740, 720 920', width: 2.0 },
      { d: 'M720 900 C660 740, 640 560, 720 420 C800 560, 780 740, 720 900', width: 1.8 },
      { d: 'M420 880 C440 720, 540 600, 720 580 C900 600, 1000 720, 1020 880', width: 1.4 },
    ],
  },

  // 10. Colombo (City lights on the harbour - Modern): Coastal tide lines & calm horizon meridian
  colombo: {
    id: 'colombo',
    paths: [
      { d: 'M-40 680 Q720 640 1480 680', width: 1.8 },
      { d: 'M-20 760 Q720 730 1460 760', width: 1.6 },
      { d: 'M20 840 Q720 820 1420 840', width: 1.4 },
      { d: 'M160 920 L640 600', width: 1.2 },
      { d: 'M1280 920 L800 600', width: 1.2 },
      { d: 'M720 940 L720 620', width: 1.2 },
    ],
  },

  // 11. Spark (Neon lines & wide type - Modern): Crisp diagonal focus vectors
  spark: {
    id: 'spark',
    paths: [
      { d: 'M-60 820 L1500 240', width: 2.2 },
      { d: 'M-40 880 L1520 300', width: 1.6 },
      { d: 'M180 -40 L1180 940', width: 1.4 },
      { d: 'M240 -40 L1240 940', width: 1.2 },
    ],
  },
};
