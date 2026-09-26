import {describe,expect,it} from 'vitest';import{decryptCaesar,encryptCaesar}from'./caesar';import{answersMatch,normalizeAnswer}from'./validation';
describe('Caesar cipher',()=>{it('encrypts the challenge text',()=>expect(encryptCaesar('READ IN THE NAME OF YOUR LORD')).toBe('UHDG LQ WKH QDPH RI BRXU ORUG'));it('decrypts',()=>expect(decryptCaesar('UHDG')).toBe('READ'));it('wraps and preserves case',()=>expect(encryptCaesar('XyZ')).toBe('AbC'));it('normalizes answers',()=>{expect(normalizeAnswer(' read   in! ')).toBe('READ IN');expect(answersMatch('Read, in  the name of your lord.','READ IN THE NAME OF YOUR LORD')).toBe(true);});});
describe('cipher recovery regressions',()=>{
  it('wraps backward and preserves spaces and punctuation',()=>expect(decryptCaesar('AbC  !')).toBe('XyZ  !'));
  it('round trips the whole challenge',()=>expect(decryptCaesar(encryptCaesar('READ IN THE NAME OF YOUR LORD'))).toBe('READ IN THE NAME OF YOUR LORD'));
  it('rejects wrong words and inserted digits',()=>{
    expect(answersMatch('READ IN THE NAME OF OUR LORD','READ IN THE NAME OF YOUR LORD')).toBe(false);
    expect(answersMatch('R123EAD','READ')).toBe(false);
  });
});
