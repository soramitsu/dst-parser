// src/index.ts
function ExampleSyntaxError(message = "") {
  this.name = "ExampleSyntaxError";
  this.message = message;
}
ExampleSyntaxError.prototype = Error.prototype;
var range = function(start, end) {
  let src = Array.from(Array(end - start + 1).keys());
  return src.map((x) => x + start);
};
function emptySpace(str) {
  return str.trim().length === 0;
}
function trimEmptyLines(lines) {
  while (emptySpace(lines.at(0) || ""))
    lines.shift();
  while (emptySpace(lines.at(-1) || ""))
    lines.pop();
  return lines;
}
var clearIndentation = function(lines) {
  let common_indent = getCommonStartPadding(lines);
  return lines.map(
    (line) => {
      return line.slice(common_indent);
    }
  );
};
function spaceSectionEquals(lines, prefix_len) {
  let prefixes = lines.map((line) => {
    return line.slice(0, prefix_len);
  });
  let prefixIsTrimmable = lines[0].slice(0, prefix_len).trim().length === 0;
  let prefixesAreEqual = prefixes.every((v) => v === lines[0].slice(0, prefix_len));
  return prefixIsTrimmable && prefixesAreEqual;
}
function getCommonStartPadding(lines) {
  let knownMaxLen = 0;
  let currentLen = 0;
  if (lines.length) {
    while (true) {
      currentLen++;
      if (spaceSectionEquals(lines, currentLen)) {
        knownMaxLen = currentLen;
      } else
        break;
    }
  }
  return knownMaxLen;
}
var exampleRegExps = {
  begin_fragment: new RegExp("[s	]*(//|#) (BEGIN FRAGMENT): ([A-Za-z_-]+)[s	]*"),
  end_fragment: new RegExp("[s	]*(//|#) (END FRAGMENT)[s	]*"),
  begin_escape: new RegExp("[s	]*(//|#) (BEGIN ESCAPE)[s	]*"),
  end_escape: new RegExp("[s	]*(//|#) (END ESCAPE)[s	]*")
};
var ExampleParser = class {
  constructor(content) {
    this.lines = content.split("\n");
  }
  detectLineType(line) {
    let result = null;
    let matchTmp;
    if (matchTmp = line.match(exampleRegExps.begin_fragment)) {
      result = [matchTmp[2], matchTmp[3]];
    }
    if (matchTmp = line.match(exampleRegExps.end_fragment)) {
      result = [matchTmp[2]];
    }
    if (matchTmp = line.match(exampleRegExps.begin_escape)) {
      result = [matchTmp[2]];
    }
    if (matchTmp = line.match(exampleRegExps.end_escape)) {
      result = [matchTmp[2]];
    }
    return result;
  }
  retrieveTextSection(start, end, ignore) {
    let result = null;
    if (end > start) {
      let tmp_result = [];
      for (let lineId = start; lineId < end; lineId++) {
        if (ignore.indexOf(lineId) == -1)
          tmp_result.push(this.lines[lineId]);
      }
      if (tmp_result.length > 0) {
        result = clearIndentation(
          trimEmptyLines(tmp_result)
        ).join("\n");
      }
    }
    return result;
  }
  mapLines() {
    let fragmentStack = Array();
    let fragmentSections = Array();
    let fragmentMap = {};
    let escapeStack = Array();
    let escapeList = Array();
    let lineType;
    for (let lineId = 0; lineId < this.lines.length; lineId++) {
      lineType = this.detectLineType(this.lines[lineId]);
      if (lineType) {
        if (lineType[0] == "BEGIN FRAGMENT") {
          fragmentStack.push([lineId, lineType[1]]);
          if (escapeList.indexOf(lineId) == -1)
            escapeList.push(lineId);
        } else if (lineType[0] == "END FRAGMENT") {
          if (fragmentStack.length > 0) {
            let tmp = fragmentStack.pop();
            if (escapeList.indexOf(lineId) == -1)
              escapeList.push(lineId);
            let fragmentStart = tmp[0];
            fragmentSections.push([fragmentStart, lineId, tmp[1]]);
          } else {
            throw new ExampleSyntaxError(
              `Ending a code fragment without a beginning one on line ${lineId}.Content: "${this.lines[lineId]}"`
            );
          }
        } else if (lineType[0] == "BEGIN ESCAPE") {
          escapeStack.push([lineId, lineType[0]]);
          if (escapeList.indexOf(lineId) == -1)
            escapeList.push(lineId);
        } else if (lineType[0] == "END ESCAPE") {
          if (fragmentStack.length > 0) {
            let tmp = escapeStack.pop();
            if (escapeList.indexOf(lineId) == -1)
              escapeList.push(lineId);
            escapeList.push(...range(tmp[0], lineId));
          } else {
            throw new ExampleSyntaxError(
              `Ending the escape section without a beginning one on line ${lineId}.Content: "${this.lines[lineId]}"`
            );
          }
        }
      }
    }
    if (fragmentStack.length > 0) {
      const fstHangingId = fragmentStack[0][0];
      throw new ExampleSyntaxError(
        `Beginning fragment without ending it on line ${fstHangingId}.Content: "${this.lines[fstHangingId]}"`
      );
    }
    if (escapeStack.length) {
      const estHangingId = escapeStack[0][0];
      throw new ExampleSyntaxError(
        `Beginning escape without ending it on line ${estHangingId}.Content: "${this.lines[estHangingId]}"`
      );
    }
    for (let fsid = 0; fsid < fragmentSections.length; fsid++) {
      let start_line_id = fragmentSections[fsid][0];
      let end_line_id = fragmentSections[fsid][1];
      let textSection = this.retrieveTextSection(
        start_line_id,
        end_line_id,
        escapeList
      );
      if (textSection) {
        fragmentMap[fragmentSections[fsid][2]] = textSection;
      }
    }
    return fragmentMap;
  }
};
export {
  ExampleParser,
  ExampleSyntaxError,
  trimEmptyLines
};
