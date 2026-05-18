// JS-aware text scanner used by Phase 2 form routing to locate a leaf
// array inside data.js without requiring a marker comment per array.
//
// The scanner understands:
//   - double-quoted strings (with \" escapes)
//   - single-quoted strings
//   - template literals (with \` escapes)
//   - // line comments
//   - /* block comments */
//
// It only counts `[` `]` `{` `}` brackets that appear *outside* of any
// of those, which is what we need for matching-bracket lookup against
// real-world data.js content (people put `]` and `}` inside strings).
//
// Public API:
//   findMatchingBracket(text, openIdx)
//     Given the index of `[` or `{`, return the index of its matching
//     closer. Throws on mismatch.
//
//   locateArrayInsertPos(text, path)
//     Walk `text` following `path` and return the position just before
//     the closing `]` of the leaf array — i.e. where a new entry should
//     be inserted. Path syntax:
//       ["faculty", { section: "OFFICE OF THE DEAN" }, "rows"]
//       ["groups"]
//       ["groups", { name: "The Marlowe Family" }, "members"]
//       ["clubs", { name: "Powerball" }, "teams", { house: "Valaris" }, "positions"]
//     String segments are object keys (e.g. `rows:`); object segments
//     are selectors that match the next child object containing all
//     given key-string pairs.
//
//   detectIndent(text, closeBracketIdx)
//     Looks at the line containing `text[closeBracketIdx]` and returns
//     the leading whitespace, so callers can match the array's
//     indentation when inserting a new entry.

export function findMatchingBracket(text, openIdx) {
  const opener = text[openIdx];
  if (opener !== "[" && opener !== "{") {
    throw new Error(`findMatchingBracket: not a bracket at ${openIdx} (got '${opener}')`);
  }
  const closer = opener === "[" ? "]" : "}";

  let depth = 1;
  let i = openIdx + 1;
  while (i < text.length && depth > 0) {
    const c = text[i];

    // String — skip to matching unescaped close quote.
    if (c === '"' || c === "'") {
      const q = c;
      i++;
      while (i < text.length && text[i] !== q) {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "`") {
      i++;
      while (i < text.length && text[i] !== "`") {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length - 1 && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    if (c === opener) depth++;
    else if (c === closer) depth--;
    i++;
  }

  if (depth !== 0) {
    throw new Error(`findMatchingBracket: unmatched ${opener} starting at ${openIdx}`);
  }
  return i - 1;
}

// Find the start position of the *value* for `key` within `[from, to)`.
// Matches `<key>:` with optional whitespace, requiring a non-identifier
// char immediately before the key so `xxxname:` doesn't match `name:`.
//
// CRITICAL: only looks at the *current scope depth*. When the scanner
// hits a nested `[` or `{`, it skips to the matching closer — so a path
// segment like "groups" matches the top-level `groups:` and not a
// `groups:` field buried inside a club object inside `clubs:`.
function findKeyValueStart(text, key, from, to) {
  const keyLen = key.length;
  let i = from;
  while (i < to) {
    const c = text[i];

    if (c === '"' || c === "'") {
      const q = c;
      i++;
      while (i < to && text[i] !== q) {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "`") {
      i++;
      while (i < to && text[i] !== "`") {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < to && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < to - 1 && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    // Nested array/object — skip its entire contents so we don't match
    // keys at deeper depths.
    if (c === "[" || c === "{") {
      const close = findMatchingBracket(text, i);
      i = close + 1;
      continue;
    }

    // Try key match here.
    if (text.substr(i, keyLen) === key) {
      const before = i === 0 ? " " : text[i - 1];
      // Identifier-boundary check on the left side.
      if (!/[A-Za-z0-9_$]/.test(before)) {
        // Skip whitespace after key, expect `:`.
        let j = i + keyLen;
        while (j < to && /\s/.test(text[j])) j++;
        if (text[j] === ":") {
          // Skip whitespace after colon to land on the value start.
          let v = j + 1;
          while (v < to && /\s/.test(text[v])) v++;
          return v;
        }
      }
    }
    i++;
  }
  return -1;
}

// Match `<key>: "<value>"` literally somewhere in [from, to). Returns
// the position of the key (not the value).
function findKeyStringValue(text, key, value, from, to) {
  let i = from;
  while (i < to) {
    const vstart = findKeyValueStart(text, key, i, to);
    if (vstart < 0) return -1;
    // Expect `"value"` at vstart.
    if (text[vstart] === '"') {
      const valueLit = `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      if (text.substr(vstart, valueLit.length) === valueLit) {
        // Walk back to the key position for the caller.
        // We know vstart is value start; find the matching key by going
        // backward over whitespace + colon + key.
        let k = vstart - 1;
        while (k > i && /\s/.test(text[k])) k--;
        if (text[k] === ":") k--;
        while (k > i && /\s/.test(text[k])) k--;
        // Now k is at the last char of the key.
        return k - key.length + 1;
      }
    }
    i = vstart + 1;
  }
  return -1;
}

// Find the next child object inside scope [from, to) whose top-level
// fields satisfy *every* (key, value) pair in `selector`. Returns the
// object's brace bounds, or null.
function findObject(text, from, to, selector) {
  let i = from;
  while (i < to) {
    const c = text[i];

    if (c === '"' || c === "'") {
      const q = c;
      i++;
      while (i < to && text[i] !== q) {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "`") {
      i++;
      while (i < to && text[i] !== "`") {
        if (text[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < to && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < to - 1 && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    if (c === "{") {
      const close = findMatchingBracket(text, i);
      // Check that every selector key-value matches inside this object,
      // looking only at the immediate top-level (we don't recurse —
      // findKeyStringValue scans the whole object body which is mostly
      // fine for our use case because the selector keys here are
      // typically `name`/`section`/`tier`/`house` which appear at the
      // top level of the matched object before any nested array).
      const objStart = i + 1;
      const objEnd = close; // index of `}`
      let allMatch = true;
      for (const [k, v] of Object.entries(selector)) {
        if (findKeyStringValue(text, k, v, objStart, objEnd) < 0) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return { start: i, end: close };
      i = close + 1;
      continue;
    }
    i++;
  }
  return null;
}

export function locateArrayInsertPos(text, path) {
  // data.js is shaped as `window.CALDERYN = { ... }`. Path traversal
  // happens *inside* that top-level object, so narrow scope to its
  // body before walking path segments — otherwise the very first
  // step would skip past the whole object as a "nested" `{...}`.
  const rootOpen = text.indexOf("window.CALDERYN");
  if (rootOpen < 0) {
    throw new Error("locateArrayInsertPos: window.CALDERYN root object not found");
  }
  const rootBrace = text.indexOf("{", rootOpen);
  if (rootBrace < 0) {
    throw new Error("locateArrayInsertPos: opening brace for window.CALDERYN not found");
  }
  const rootClose = findMatchingBracket(text, rootBrace);
  let scopeStart = rootBrace + 1;
  let scopeEnd = rootClose;

  for (let p = 0; p < path.length; p++) {
    const seg = path[p];

    if (typeof seg === "string") {
      const vstart = findKeyValueStart(text, seg, scopeStart, scopeEnd);
      if (vstart < 0) {
        throw new Error(`locateArrayInsertPos: key not found: ${seg} (scope ${scopeStart}-${scopeEnd})`);
      }
      const open = text[vstart];
      if (open !== "[" && open !== "{") {
        throw new Error(`locateArrayInsertPos: key '${seg}' is not an array/object (value starts with '${open}')`);
      }
      const close = findMatchingBracket(text, vstart);
      scopeStart = vstart + 1;
      scopeEnd = close;
    } else if (seg && typeof seg === "object") {
      const obj = findObject(text, scopeStart, scopeEnd, seg);
      if (!obj) {
        throw new Error(`locateArrayInsertPos: no object matching ${JSON.stringify(seg)} in scope`);
      }
      scopeStart = obj.start + 1;
      scopeEnd = obj.end;
    } else {
      throw new Error(`locateArrayInsertPos: bad path segment ${JSON.stringify(seg)}`);
    }
  }

  // After all path segments, scopeEnd is the index of the closing `]`
  // (or `}`) of the leaf. We insert *before* it.
  return scopeEnd;
}

export function detectIndent(text, posOnLine) {
  // Walk back to the start of the line containing posOnLine.
  let start = posOnLine;
  while (start > 0 && text[start - 1] !== "\n") start--;
  let i = start;
  while (i < text.length && (text[i] === " " || text[i] === "\t")) i++;
  return text.slice(start, i);
}
