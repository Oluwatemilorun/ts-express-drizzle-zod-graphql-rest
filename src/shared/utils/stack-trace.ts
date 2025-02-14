/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

// This module was extracted from https://www.npmjs.com/package/stack-trace
// It is an esm module and it was easier to move it in
// TODO: Apply proper types

export interface StackFrame {
  getTypeName(): string;
  getFunctionName(): string;
  getMethodName(): string;
  getFileName(): string;
  getLineNumber(): number;
  getColumnNumber(): number;
  isNative(): boolean;
  isConstructor(): boolean;
}

export function get(belowFn?: () => void): StackFrame[] {
  const oldLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;

  const dummyObject = {};

  const v8Handler = Error.prepareStackTrace;
  Error.prepareStackTrace = function (dummyObject, v8StackTrace) {
    return v8StackTrace;
  };
  Error.captureStackTrace(dummyObject, belowFn || get);

  const v8StackTrace = (dummyObject as any).stack;
  Error.prepareStackTrace = v8Handler;
  Error.stackTraceLimit = oldLimit;

  return v8StackTrace;
}

export function parse(err: Error): StackFrame[] {
  if (!err.stack) {
    return [];
  }

  const lines = err.stack.split('\n').slice(1);
  return lines
    .map(function (line: any) {
      if (line.match(/^\s*[-]{4,}$/)) {
        return createParsedCallSite({
          fileName: line,
          lineNumber: null,
          functionName: null,
          typeName: null,
          methodName: null,
          columnNumber: null,
          native: null,
        });
      }

      const lineMatch = line.match(
        /at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/,
      );
      if (!lineMatch) {
        return;
      }

      let object = null;
      let method = null;
      let functionName = null;
      let typeName = null;
      let methodName = null;
      const isNative = lineMatch[5] === 'native';

      if (lineMatch[1]) {
        functionName = lineMatch[1];
        let methodStart = functionName.lastIndexOf('.');
        if (functionName[methodStart - 1] == '.') methodStart--;
        if (methodStart > 0) {
          object = functionName.substr(0, methodStart);
          method = functionName.substr(methodStart + 1);
          const objectEnd = object.indexOf('.Module');
          if (objectEnd > 0) {
            functionName = functionName.substr(objectEnd + 1);
            object = object.substr(0, objectEnd);
          }
        }
      }

      if (method) {
        typeName = object;
        methodName = method;
      }

      if (method === '<anonymous>') {
        methodName = null;
        functionName = null;
      }

      const properties = {
        fileName: lineMatch[2] || null,
        lineNumber: parseInt(lineMatch[3], 10) || null,
        functionName: functionName,
        typeName: typeName,
        methodName: methodName,
        columnNumber: parseInt(lineMatch[4], 10) || null,
        native: isNative,
      };

      return createParsedCallSite(properties);
    })
    .filter(function (callSite: any) {
      return !!callSite;
    });
}

function CallSite(this: any, properties: any) {
  for (const property in properties) {
    this[property] = properties[property];
  }
}

const strProperties = [
  'this',
  'typeName',
  'functionName',
  'methodName',
  'fileName',
  'lineNumber',
  'columnNumber',
  'function',
  'evalOrigin',
];

const boolProperties = ['topLevel', 'eval', 'native', 'constructor'];

strProperties.forEach(function (property) {
  CallSite.prototype[property] = null;
  CallSite.prototype['get' + property[0].toUpperCase() + property.substr(1)] =
    function () {
      return this[property];
    };
});

boolProperties.forEach(function (property) {
  CallSite.prototype[property] = false;
  CallSite.prototype['is' + property[0].toUpperCase() + property.substr(1)] =
    function () {
      return this[property];
    };
});

function createParsedCallSite(properties: any) {
  return new (CallSite as any)(properties);
}
