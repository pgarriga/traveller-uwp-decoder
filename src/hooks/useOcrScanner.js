import { useState, useRef, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { UWP_PATTERN, formatUwp } from "../utils/uwp";
import { isCommonWord, OCR_SETTINGS } from "../constants/ocr";

export const useOcrScanner = (t) => {
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const fileInputRef = useRef(null);

  const resetStatus = useCallback(() => {
    setScanStatus("");
  }, []);

  const handleScan = useCallback(async (file) => {
    if (!file) return null;

    setScanning(true);
    setScanStatus(t("loadingOcr"));

    try {
      const worker = await createWorker("eng");
      setScanStatus(t("scanning"));

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const matches = text.match(UWP_PATTERN);

      if (matches && matches.length > 0) {
        const formattedUwp = formatUwp(matches[0]);
        setScanStatus(`${t("uwpDetected")}: ${formattedUwp}`);

        // Try to find planet name
        const detectedName = extractPlanetName(text, matches[0]);

        if (detectedName) {
          setScanStatus(prev => `${prev} | ${t("nameDetected")}: ${detectedName}`);
        }

        return { uwp: formattedUwp, name: detectedName };
      } else {
        setScanStatus(t("noUwpFound"));
        return null;
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setScanStatus(t("scanError"));
      return null;
    } finally {
      setScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [t]);

  // Handle file input change event
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    return handleScan(file);
  }, [handleScan]);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    scanning,
    scanStatus,
    fileInputRef,
    handleScan,
    handleFileChange,
    triggerFileInput,
    resetStatus,
  };
};

// Extract planet name from OCR text
const extractPlanetName = (text, uwpMatch) => {
  const uwpIndex = text.indexOf(uwpMatch);
  const textAfter = text.slice(
    uwpIndex + uwpMatch.length,
    uwpIndex + uwpMatch.length + OCR_SETTINGS.NAME_SEARCH_LENGTH
  );

  const lines = text.split(/[\n\r]+/);
  const uwpLineIndex = lines.findIndex(line => line.includes(uwpMatch));

  // Strategy 1: Check lines after UWP
  if (uwpLineIndex >= 0) {
    const maxLine = Math.min(uwpLineIndex + OCR_SETTINGS.NAME_SEARCH_LINES, lines.length);
    for (let i = uwpLineIndex + 1; i < maxLine; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cleaned = line.replace(/[^a-zA-Z\s'-]/g, "").trim();

      if (cleaned.length < OCR_SETTINGS.NAME_MIN_LENGTH) continue;
      if (cleaned.length > OCR_SETTINGS.NAME_MAX_LENGTH) continue;
      if (isCommonWord(cleaned)) continue;
      if (/^[ABCDEX][0-9A-F]/i.test(cleaned)) continue;

      return formatName(cleaned);
    }
  }

  // Strategy 2: Look for capitalized words after UWP
  const capsPattern = /\b([A-Z][A-Za-z'-]{2,}(?:\s+[A-Z][A-Za-z'-]+)*)\b/g;
  const capsMatches = textAfter.match(capsPattern) || [];
  const filtered = capsMatches.filter(w =>
    w.length >= OCR_SETTINGS.NAME_MIN_LENGTH &&
    w.length <= OCR_SETTINGS.NAME_MAX_LENGTH &&
    !isCommonWord(w)
  );

  if (filtered.length > 0) {
    return filtered[0];
  }

  return null;
};

// Format name with proper capitalization
const formatName = (name) => {
  return name.split(/\s+/).map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(" ");
};
