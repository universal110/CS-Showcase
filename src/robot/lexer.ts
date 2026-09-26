export type TokenType = 'IDENT'|'NUMBER'|'LPAREN'|'RPAREN'|'LBRACE'|'RBRACE'|'SEMICOLON'|'NOT'|'AND'|'OR'|'EOF';
export interface Token { type: TokenType; value: string; line: number }
export class LexerError extends Error { constructor(public line: number, message: string) { super(message); } }
export const lex = (source: string): Token[] => {
  if (source.length > 12000) throw new LexerError(1, 'Program is too long (maximum 12,000 characters).');
  const tokens: Token[] = []; let i = 0; let line = 1;
  while (i < source.length) {
    if (tokens.length >= 2000) throw new LexerError(line, 'Program is too complex (maximum 2,000 tokens).');
    const char = source[i];
    if (char === '\n') { line++; i++; continue; }
    if (/\s/.test(char)) { i++; continue; }
    if (char === '/' && source[i+1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
    const simple: Record<string,TokenType> = {'(':'LPAREN',')':'RPAREN','{':'LBRACE','}':'RBRACE',';':'SEMICOLON','!':'NOT'};
    if (simple[char]) { tokens.push({type:simple[char],value:char,line}); i++; continue; }
    if (source.slice(i,i+2) === '&&' || source.slice(i,i+2) === '||') { const value=source.slice(i,i+2); tokens.push({type:value==='&&'?'AND':'OR',value,line}); i+=2; continue; }
    if (/[A-Za-z_]/.test(char)) { const start=i++; while (i<source.length && /[A-Za-z0-9_]/.test(source[i])) i++; tokens.push({type:'IDENT',value:source.slice(start,i).toUpperCase(),line}); continue; }
    if (/\d/.test(char)) { const start=i++; while (i<source.length && /\d/.test(source[i])) i++; tokens.push({type:'NUMBER',value:source.slice(start,i),line}); continue; }
    throw new LexerError(line, `Unexpected character “${char}”`);
  }
  tokens.push({type:'EOF',value:'',line}); return tokens;
};
