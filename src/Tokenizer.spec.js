const { expect } = require('chai');

const { EscapeMode, Tokenizer } = require('./Tokenizer');

describe('Tokenizer.js', () => {
  // let tokenizer;

  // beforeEach(() => {

  // });

  describe('general', () => {
    let tokenizer;

    beforeEach(() => {
      tokenizer = new Tokenizer({ delimiter: ',' });
    });

    it('should tokenize a line using a configurable delimiter', () => {
      const testLine = 'one,two,three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', 'two', 'three']);
    });

    it('should recognize an empty token at the beginning of a line', () => {
      const testLine = ',two,three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['', 'two', 'three']);
    });

    it('should recognize an empty token in the middle of a line', () => {
      const testLine = 'one,,three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', '', 'three']);
    });

    it('should recognize an empty token at the end of a line', () => {
      const testLine = 'one,two,';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', 'two', '']);
    });

    it('should throw an error if an escaped string is not closed', () => {
      tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
      });
      expect(() => tokenizer.getTokens('one,"two,')).to.throw;
    });

    it('should ignore escape characters if escape mode is set to none', () => {
      tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.none,
      });
      expect(tokenizer.getTokens('one,"two,')).to.deep.equal(['one', '"two', '']);
    });
  });

  describe('_stripEscapeChars', () => {
    let tokenizer;

    beforeEach(() => {
      tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
        keepEscapeChars: false,
      });
    });

    it('should strip escape characters from a token string', () => {
      expect(tokenizer._stripEscapeChars('"foo"')).to.equal('foo');
      expect(tokenizer._stripEscapeChars('"foo" and "bar"')).to.equal('foo and bar');
    });

    it('should keep escaped escape characters', () => {
      expect(tokenizer._stripEscapeChars('""""')).to.equal('""');
      expect(tokenizer._stripEscapeChars('""foo""')).to.equal('"foo"');
      expect(tokenizer._stripEscapeChars('""foo"" and ""bar""')).to.equal('"foo" and "bar"');
      expect(tokenizer._stripEscapeChars('"foo ""and"" bar"')).to.equal('foo "and" bar');
    });
  });

  describe('keepEscapeChars = true (default configuration)', () => {
    it('should escape a single character if configured with "EscapeMode.char"', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.char,
        escapeChar: '\\',
      });
      const testLine = 'one,\\,,three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', '\\,', 'three']);
    });

    it('should escape a string if configured with "EscapeMode.string"', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
      });
      const testLine = 'one,",,,",three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', '",,,"', 'three']);
    });

    it('should escape an escape character if the escape character appears twice in a row', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
      });
      let tokens = tokenizer.getTokens('one,"",three');
      expect(tokens).to.deep.equal(['one', '""', 'three']);
      tokens = tokenizer.getTokens('one,"""",three');
      expect(tokens).to.deep.equal(['one', '""""', 'three']);
    });

    it('should allow multiple escaped sequences in a single token', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
      });
      let tokens = tokenizer.getTokens('one,","",",three');
      expect(tokens).to.deep.equal(['one', '","","', 'three']);
    });
  });

  describe('keepEscapeChars = false', () => {
    it('should escape a single character if configured with "EscapeMode.char"', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.char,
        escapeChar: '\\',
        keepEscapeChars: false,
      });
      const testLine = 'one,\\,,three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', ',', 'three']);
    });

    it('should escape a string if configured with "EscapeMode.string"', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
        keepEscapeChars: false,
      });
      const testLine = 'one,",,,",three';
      let tokens = tokenizer.getTokens(testLine);
      expect(tokens).to.deep.equal(['one', ',,,', 'three']);
    });

    it('should escape an escape character if the escape character appears twice in a row', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
        keepEscapeChars: false,
      });
      let tokens = tokenizer.getTokens('one,"",three');
      expect(tokens).to.deep.equal(['one', '"', 'three']);
      tokens = tokenizer.getTokens('one,"""",three');
      expect(tokens).to.deep.equal(['one', '""', 'three']);
    });

    it('should allow multiple escaped sequences in a single token', () => {
      const tokenizer = new Tokenizer({
        delimiter: ',',
        escapeMode: EscapeMode.string,
        escapeChar: '"',
        keepEscapeChars: false,
      });
      let tokens = tokenizer.getTokens('one,","",",three');
      expect(tokens).to.deep.equal(['one', ',",', 'three']);
    });
  });
});
