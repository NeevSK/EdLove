# Font Setup Guide

## Fonts Needed

We need **Noto Sans Sinhala** and **Noto Sans Tamil** fonts from Google Fonts.

## Download Instructions

### 1. Download Fonts

**Noto Sans Sinhala:**
1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Sinhala
2. Click "Download family" button
3. Extract the ZIP file
4. You'll need these weights:
   - `NotoSansSinhala-Regular.ttf`
   - `NotoSansSinhala-Medium.ttf`
   - `NotoSansSinhala-Bold.ttf`

**Noto Sans Tamil:**
1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Tamil
2. Click "Download family" button
3. Extract the ZIP file
4. You'll need these weights:
   - `NotoSansTamil-Regular.ttf`
   - `NotoSansTamil-Medium.ttf`
   - `NotoSansTamil-Bold.ttf`

### 2. Place Fonts in Project

Copy the `.ttf` files to:
```
apps/gurudevi-mobile/assets/fonts/
```

**Expected file structure:**
```
assets/
└── fonts/
    ├── NotoSansSinhala-Regular.ttf
    ├── NotoSansSinhala-Medium.ttf
    ├── NotoSansSinhala-Bold.ttf
    ├── NotoSansTamil-Regular.ttf
    ├── NotoSansTamil-Medium.ttf
    └── NotoSansTamil-Bold.ttf
```

### 3. Font Loading

The font loading code has already been created in:
- `src/constants/Fonts.ts` - Font family names
- Font loading in `App.tsx` - Using expo-font

### 4. Test Fonts

After placing fonts, restart the app:
```bash
npx expo start --clear
```

You should see Sinhala and Tamil text rendered with proper fonts!

## Troubleshooting

**Fonts not loading?**
- Check file names match exactly (case-sensitive)
- Ensure fonts are in `assets/fonts/` directory
- Restart with clear cache: `npx expo start --clear`

**Text looks wrong?**
- Make sure you downloaded the **"static"** fonts (not variable fonts)
- Check that you have Regular, Medium, and Bold weights

## Why These Fonts?

**Noto Sans** = Designed by Google to support ALL languages
- **Sinhala** = සිංහල script support
- **Tamil** = தமிழ் script support
- **Sans** = Clean, modern, readable
- **Free & Open Source** = Perfect for our project!

---

**Next Step:** Download the fonts manually and place them in `assets/fonts/`, then restart the app!
