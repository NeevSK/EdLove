# Gallery Scanning Fix (JS-Based)

## Problem
The `expo-barcode-scanner` library causes a native crash ("Cannot find native module") because it is not supported in Expo SDK 54.
The user wants a "working" gallery scanner, not just removing the feature.

## Solution
We will implement a **pure JavaScript** QR decoding pipeline. This works in Expo Go and all builds without requiring unsupported native modules.

### Pipeline
1.  **Pick Image**: Use `expo-image-picker` (Already present).
2.  **Resize**: Use `expo-image-manipulator` to downscale the image to ~500px (Crucial for JS performance).
3.  **Read Data**: Use `expo-file-system` to read the resized image as Base64.
4.  **Decode Image**: Use `jpeg-js` to convert Base64 JPEG data into raw `Uint8Array` pixel data (RGBA).
5.  **Scan QR**: Use `jsqr` library to find the QR code in the pixel data.

## Proposed Changes

### Dependencies
- [REMOVE] `expo-barcode-scanner` (Crash source).
- [NEW] `jsqr`: Pure JS QR decoder.
- [NEW] `jpeg-js`: Pure JS JPEG decoder.
- [NEW] `expo-image-manipulator`: For resizing.
- [NEW] `expo-file-system`: For reading files.
- [NEW] `buffer`: For binary data handling.

### Files

#### [MODIFY] [ScannerModal.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/shared/ScannerModal.tsx)
- Remove `BarCodeScanner` import.
- Import `jsqr`, `jpeg`, `FileSystem`, `ImageManipulator`.
- Update `pickImage` function to implement the pipeline above.

## Verification
- Scan from Gallery should work with:
    - Screenshots.
    - Camera photos.
- App should NO LONGER crash on start or when using scanner.
