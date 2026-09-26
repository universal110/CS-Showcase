import { lex, LexerError, type Token, type TokenType } from './lexer';
import type { CommandName, Expression, ParseError, ProgramNode, SensorName, Statement } from './types';
export class ParserError extends Error { kind='parse' as const; constructor(public line:number,message:string){super(message)} }
const commands = new Set(['MOVE','TURN_LEFT','TURN_RIGHT']);
const sensors = new Set(['FRONT_CLEAR','LEFT_CLEAR','RIGHT_CLEAR','ON_TARGET','FACING_QIBLA']);
class Parser {
  private depth=0;
  private nested<T>(read:()=>T):T {
    if (++this.depth > 64) throw new ParserError(this.peek().line, 'Too much nesting (maximum 64 levels).');
    try { return read(); } finally { this.depth--; }
  }
  private current=0; constructor(private tokens:Token[]){}
  parse():ProgramNode { const body:Statement[]=[]; while(!this.check('EOF')) body.push(this.statement()); return {type:'Program',body}; }
  private statement():Statement {
    return this.nested(()=>this.statementInner());
  }
  private statementInner():Statement {
    const token=this.peek();
    if(token.type==='IDENT' && token.value==='IF') return this.ifStatement();
    if(token.type==='IDENT' && token.value==='WHILE') return this.whileStatement();
    if(token.type==='IDENT' && commands.has(token.value)) return this.command();
    throw new ParserError(token.line,'Expected a command, if, or while');
  }
  private command():Statement { const name=this.advance(); this.consume('LPAREN','Expected “(”'); let argument:number|undefined;
    if(!this.check('RPAREN')) { if(name.value!=='MOVE') throw new ParserError(this.peek().line,'This command takes no arguments'); const number=this.consume('NUMBER','MOVE expects a whole number'); argument=Number(number.value); if(argument<1||argument>99) throw new ParserError(number.line,'MOVE distance must be between 1 and 99'); }
    this.consume('RPAREN','Expected “)”'); this.consume('SEMICOLON','Expected “;” after command'); return {type:'Command',name:name.value as CommandName,argument,line:name.line}; }
  private ifStatement():Statement { const start=this.advance(); this.consume('LPAREN','Expected “(” after if'); const condition=this.expression(); this.consume('RPAREN','Expected “)” after condition'); const consequent=this.block(); let alternate:Statement[]=[]; if(this.peek().type==='IDENT'&&this.peek().value==='ELSE'){this.advance();alternate=this.block();} return {type:'If',condition,consequent,alternate,line:start.line}; }
  private whileStatement():Statement { const start=this.advance(); this.consume('LPAREN','Expected “(” after while'); const condition=this.expression(); this.consume('RPAREN','Expected “)” after condition'); return {type:'While',condition,body:this.block(),line:start.line}; }
  private block():Statement[]{this.consume('LBRACE','Expected “{”');const body:Statement[]=[];while(!this.check('RBRACE')&&!this.check('EOF'))body.push(this.statement());this.consume('RBRACE','Expected “}”');return body;}
  private expression():Expression{return this.or();}
  private or():Expression{let expr=this.and();while(this.match('OR')){const op=this.previous();expr={type:'Binary',operator:'||',left:expr,right:this.and(),line:op.line};}return expr;}
  private and():Expression{let expr=this.unary();while(this.match('AND')){const op=this.previous();expr={type:'Binary',operator:'&&',left:expr,right:this.unary(),line:op.line};}return expr;}
  private unary():Expression{return this.nested(()=>this.unaryInner());} private unaryInner():Expression{if(this.match('NOT')){const op=this.previous();return{type:'Not',operand:this.unary(),line:op.line};}if(this.match('LPAREN')){const expr=this.expression();this.consume('RPAREN','Expected “)”');return expr;}const token=this.consume('IDENT','Expected a sensor condition');if(token.value==='TRUE'||token.value==='FALSE')return{type:'Boolean',value:token.value==='TRUE',line:token.line};if(!sensors.has(token.value))throw new ParserError(token.line,'Unknown sensor');this.consume('LPAREN','Expected “(”');this.consume('RPAREN','Expected “)”');return{type:'Sensor',name:token.value as SensorName,line:token.line};}
  private match(type:TokenType){if(!this.check(type))return false;this.advance();return true} private check(type:TokenType){return this.peek().type===type} private advance(){if(!this.check('EOF'))this.current++;return this.previous()} private peek(){return this.tokens[this.current]} private previous(){return this.tokens[this.current-1]} private consume(type:TokenType,message:string){if(this.check(type))return this.advance();throw new ParserError(this.peek().line,message)}
}
export const parse = (source:string):ProgramNode => { try { return new Parser(lex(source)).parse(); } catch(error){ if(error instanceof ParserError)throw error;if(error instanceof LexerError)throw new ParserError(error.line,error.message);throw error;} };
export const toParseError = (error:unknown):ParseError => error instanceof ParserError ? {kind:'parse',line:error.line,message:error.message}:{kind:'parse',line:1,message:'Unable to parse program'};
