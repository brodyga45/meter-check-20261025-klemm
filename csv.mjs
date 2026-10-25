export const MAX_BYTES = 2 * 1024 * 1024;
export class CsvError extends Error {}
export class CsvFieldError extends CsvError {}
export function parseCsv(input, delimiter = ',') {
  if (delimiter.length !== 1 || ['"', '\r', '\n', '\0'].includes(delimiter)) throw new CsvError('Choose a single valid separator.');
  if (new TextEncoder().encode(input).byteLength > MAX_BYTES) throw new CsvError('Use a UTF-8 table no larger than 2 MiB.');
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  let i = 0, line = 1, column = 1, field = '', row = [], quoted = false, closed = false, touched = false;
  const rows = [];
  function step() {
    const ch = text[i++];
    if (ch === '\r') { line++; column = 1; }
    else if (ch === '\n') { if (text[i - 2] !== '\r') line++; column = 1; }
    else column++;
    return ch;
  }
  function finish(endLine) {
    if (touched) row.push(field);
    rows.push({ cells: row, line: endLine });
    if (rows.length > 2001) throw new CsvError('Check at most 2,000 equipment rows at a time. Split this batch.');
    row = []; field = ''; closed = false; touched = false;
  }
  while (i < text.length) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        step();
        if (text[i] === '"') { field += step(); }
        else { quoted = false; closed = true; }
      } else field += step();
      continue;
    }
    if (ch === delimiter) { row.push(field); field = ''; closed = false; touched = true; step(); continue; }
    if (ch === '\r' || ch === '\n') {
      const endLine = line; const newline = step();
      if (newline === '\r' && text[i] === '\n') step();
      finish(endLine); continue;
    }
    if (closed) throw new CsvError('Unexpected character after a closing quote at line ' + line + ', column ' + column + '.');
    if (ch === '"') {
      if (field.length) throw new CsvError('A quoted field must start with a quote at line ' + line + ', column ' + column + '.');
      quoted = true; touched = true; step(); continue;
    }
    touched = true; field += step();
  }
  if (quoted) throw new CsvError('Unclosed quoted field near line ' + line + '.');
  if (touched) finish(line);
  if (!rows.length || !rows[0].cells.length) throw new CsvError('Add a header row and CSV data.');
  const headers = rows.shift().cells;
  if (headers.length > 80) throw new CsvError('Use a table with at most 80 columns.');
  if (headers.some(h => !h.trim())) throw new CsvError('Header names must not be empty or whitespace-only.');
  if (new Set(headers).size !== headers.length) throw new CsvError('Header names must be unique (exact matches).');
  const records = rows.map(r => {
    if (r.cells.length !== headers.length) throw new CsvError('Record ending on line ' + r.line + ': expected ' + headers.length + ' cells, found ' + r.cells.length + '. Check the separator and quoting.');
    return Object.fromEntries(headers.map((h, j) => [h, r.cells[j]]));
  });
  return { headers, records };
}
