export const shiftText = (text: string, shift: number): string => {
  const normalized = ((shift % 26) + 26) % 26;
  return [...text].map((char) => {
    const code = char.charCodeAt(0);
    const base = code >= 65 && code <= 90 ? 65 : code >= 97 && code <= 122 ? 97 : null;
    return base === null ? char : String.fromCharCode(base + ((code - base + normalized) % 26));
  }).join('');
};
export const encryptCaesar = (text: string, shift = 3) => shiftText(text, shift);
export const decryptCaesar = (text: string, shift = 3) => shiftText(text, -shift);
