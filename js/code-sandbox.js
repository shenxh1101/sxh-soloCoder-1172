class CodeSandbox {
  runJavaScript(code) {
    try {
      let output = [];
      const mockConsole = {
        log: (...args) => {
          output.push(args.map(a => {
            if (Array.isArray(a)) return '[' + a.join(', ') + ']';
            if (typeof a === 'object' && a !== null) return JSON.stringify(a);
            return String(a);
          }).join(' '));
        }
      };
      const fn = new Function('console', code);
      fn(mockConsole);
      return { success: true, output: output.join('\n') };
    } catch (e) {
      return { success: false, output: '', error: e.message };
    }
  }

  runPython(code) {
    try {
      const interpreter = new PythonInterpreter();
      const result = interpreter.execute(code);
      return result;
    } catch (e) {
      return { success: false, output: '', error: e.message };
    }
  }

  run(code, language) {
    const trimmed = code.trim();
    if (language === 'javascript') {
      return this.runJavaScript(trimmed);
    } else if (language === 'python') {
      return this.runPython(trimmed);
    }
    return { success: false, output: '', error: '不支持的语言: ' + language };
  }
}

class PythonInterpreter {
  constructor() {
    this.variables = {};
    this.output = [];
    this.lines = [];
    this.currentLine = 0;
    this.indentSize = 4;
  }

  execute(code) {
    this.variables = {};
    this.output = [];
    this.currentLine = 0;

    const rawLines = code.split('\n');
    this.lines = rawLines.filter(l => l.trim() !== '');
    this.parseCodeStructure();

    try {
      this.executeBlock(this.structuredCode);
    } catch (e) {
      return { success: false, output: '', error: e.message || String(e) };
    }

    return { success: true, output: this.output.join('\n') };
  }

  parseCodeStructure() {
    const root = [];
    let i = 0;
    while (i < this.lines.length) {
      const result = this.parseStatement(this.lines, i, 0);
      if (result) {
        root.push(result.node);
        i = result.nextIndex;
      } else {
        i++;
      }
    }
    this.structuredCode = root;
  }

  getLineIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  parseStatement(lines, index, baseIndent) {
    if (index >= lines.length) return null;

    const line = lines[index];
    const indent = this.getLineIndent(line);
    const trimmed = line.trim();

    if (trimmed === '' || trimmed.startsWith('#')) {
      return { node: null, nextIndex: index + 1 };
    }

    const node = { type: 'statement', line: trimmed, children: [] };

    if (trimmed.endsWith(':')) {
      node.type = 'block';
      node.header = trimmed.slice(0, -1);
      const childIndent = indent + this.indentSize;
      let nextIdx = index + 1;
      while (nextIdx < lines.length) {
        const nextLine = lines[nextIdx];
        const nextIndent = this.getLineIndent(nextLine);
        if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) {
          nextIdx++;
          continue;
        }
        if (nextIndent >= childIndent) {
          const childResult = this.parseStatement(lines, nextIdx, childIndent);
          if (childResult && childResult.node) {
            node.children.push(childResult.node);
          }
          nextIdx = childResult ? childResult.nextIndex : nextIdx + 1;
        } else {
          break;
        }
      }
      return { node, nextIndex: nextIdx };
    }

    return { node, nextIndex: index + 1 };
  }

  executeBlock(nodes) {
    for (const node of nodes) {
      if (!node) continue;
      this.executeNode(node);
    }
  }

  executeNode(node) {
    switch (node.type) {
      case 'statement':
        this.executeStatement(node.line);
        break;
      case 'block':
        this.executeBlockStatement(node);
        break;
    }
  }

  executeBlockStatement(node) {
    const header = node.header.trim();

    if (header.startsWith('if ')) {
      const condition = header.slice(3).replace(/:$/, '').trim();
      if (this.evaluateCondition(condition)) {
        this.executeBlock(node.children);
      } else {
        const elseIfIndex = node.children.findIndex(c => c && c.type === 'block' && c.header && c.header.trim().startsWith('elif '));
        if (elseIfIndex === -1) {
          const elseNode = node.children.find(c => c && c.type === 'block' && c.header && c.header.trim().startsWith('else'));
          if (elseNode) this.executeBlock(elseNode.children);
        }
      }
    } else if (header.startsWith('elif ')) {
      const condition = header.slice(5).replace(/:$/, '').trim();
      if (this.evaluateCondition(condition)) {
        this.executeBlock(node.children);
      }
    } else if (header === 'else') {
      this.executeBlock(node.children);
    } else if (header.startsWith('for ')) {
      this.executeForLoop(header, node.children);
    } else if (header.startsWith('while ')) {
      const condition = header.slice(6).replace(/:$/, '').trim();
      let safety = 1000;
      while (this.evaluateCondition(condition) && safety > 0) {
        this.executeBlock(node.children);
        safety--;
      }
    } else if (header.startsWith('def ')) {
      const funcDef = header.slice(4).trim();
      const parenIndex = funcDef.indexOf('(');
      const funcName = parenIndex > -1 ? funcDef.slice(0, parenIndex).trim() : funcDef;
      const paramsStr = parenIndex > -1 ? funcDef.slice(parenIndex + 1, funcDef.lastIndexOf(')')) : '';
      const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
      this.variables[funcName] = {
        type: 'function',
        params: params,
        body: node.children
      };
    } else if (header.startsWith('else if ')) {
      const condition = header.slice(8).replace(/:$/, '').trim();
      if (this.evaluateCondition(condition)) {
        this.executeBlock(node.children);
      }
    } else {
      this.executeBlock(node.children);
    }
  }

  executeForLoop(header, body) {
    const match = header.match(/^for\s+(\w+)\s+in\s+(.+):$/);
    if (match) {
      const varName = match[1].trim();
      const iterable = this.evaluateExpression(match[2].trim());

      if (typeof iterable === 'string') {
        for (const char of iterable) {
          this.variables[varName] = char;
          this.executeBlock(body);
        }
      } else if (Array.isArray(iterable)) {
        for (const item of iterable) {
          this.variables[varName] = item;
          this.executeBlock(body);
        }
      } else if (typeof iterable === 'object' && iterable !== null) {
        for (const key of Object.keys(iterable)) {
          this.variables[varName] = key;
          this.executeBlock(body);
        }
      }
    } else {
      const rangeMatch = header.match(/^for\s+(\w+)\s+in\s+range\((.+)\):$/);
      if (rangeMatch) {
        const varName = rangeMatch[1].trim();
        const rangeArg = rangeMatch[2].trim();
        const parts = rangeArg.split(',').map(p => p.trim());
        let start = 0, end = 0, step = 1;

        if (parts.length === 1) {
          end = parseInt(this.evaluateExpression(parts[0]));
        } else if (parts.length === 2) {
          start = parseInt(this.evaluateExpression(parts[0]));
          end = parseInt(this.evaluateExpression(parts[1]));
        } else if (parts.length === 3) {
          start = parseInt(this.evaluateExpression(parts[0]));
          end = parseInt(this.evaluateExpression(parts[1]));
          step = parseInt(this.evaluateExpression(parts[2]));
        }

        for (let i = start; i < end; i += step) {
          this.variables[varName] = i;
          this.executeBlock(body);
        }
      }
    }
  }

  executeStatement(line) {
    const trimmed = line.trim();

    if (trimmed.startsWith('print(')) {
      this.executePrint(trimmed);
    } else if (trimmed.startsWith('return ')) {
      const value = this.evaluateExpression(trimmed.slice(7).trim());
      throw { type: 'return', value: value };
    } else if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=') && !trimmed.includes('<=') && !trimmed.includes('>=')) {
      this.executeAssignment(trimmed);
    } else if (trimmed.startsWith('del ')) {
      const varName = trimmed.slice(4).trim();
      delete this.variables[varName];
    } else {
      const result = this.evaluateExpression(trimmed);
      if (result !== undefined) {
        this.output.push(String(result));
      }
    }
  }

  executePrint(line) {
    const content = line.slice(6, -1).trim();
    if (content === '') {
      this.output.push('');
      return;
    }

    const args = this.splitPrintArgs(content);
    const evaluated = args.map(arg => {
      const val = this.evaluateExpression(arg.trim());
      if (val === null || val === undefined) return 'None';
      if (Array.isArray(val)) return '[' + val.map(v => this.formatValue(v)).join(', ') + ']';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });

    this.output.push(evaluated.join(' '));
  }

  splitPrintArgs(content) {
    const args = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (!inString && (ch === '"' || ch === "'")) {
        inString = true;
        stringChar = ch;
      } else if (inString && ch === stringChar && content[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }

      if (!inString) {
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        if (ch === ')' || ch === ']' || ch === '}') depth--;
      }

      if (ch === ',' && depth === 0 && !inString) {
        args.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) args.push(current);
    return args;
  }

  formatValue(val) {
    if (typeof val === 'string') return "'" + val + "'";
    return String(val);
  }

  executeAssignment(line) {
    const eqIndex = line.indexOf('=');
    const left = line.slice(0, eqIndex).trim();
    const right = line.slice(eqIndex + 1).trim();

    let value;
    if (right.startsWith('[') && right.endsWith(']')) {
      value = this.parseList(right);
    } else if (right.startsWith('{') && right.endsWith('}')) {
      value = this.parseDict(right);
    } else {
      value = this.evaluateExpression(right);
    }

    if (left.includes('[')) {
      const bracketIdx = left.indexOf('[');
      const varName = left.slice(0, bracketIdx).trim();
      const indexStr = left.slice(bracketIdx + 1, left.lastIndexOf(']')).trim();
      const index = this.evaluateExpression(indexStr);
      if (this.variables[varName]) {
        if (typeof this.variables[varName] === 'string') {
          const arr = this.variables[varName].split('');
          arr[index] = value;
          this.variables[varName] = arr.join('');
        } else {
          this.variables[varName][index] = value;
        }
      }
    } else {
      this.variables[left] = value;
    }
  }

  parseList(str) {
    const inner = str.slice(1, -1).trim();
    if (inner === '') return [];
    const items = this.splitArgs(inner);
    return items.map(item => this.evaluateExpression(item.trim()));
  }

  parseDict(str) {
    const inner = str.slice(1, -1).trim();
    if (inner === '') return {};
    const obj = {};
    const pairs = this.splitArgs(inner);
    for (const pair of pairs) {
      const colonIdx = pair.indexOf(':');
      if (colonIdx > -1) {
        const key = this.evaluateExpression(pair.slice(0, colonIdx).trim());
        const value = this.evaluateExpression(pair.slice(colonIdx + 1).trim());
        obj[String(key).replace(/^['"]|['"]$/g, '')] = value;
      }
    }
    return obj;
  }

  splitArgs(str) {
    const args = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (!inString && (ch === '"' || ch === "'")) {
        inString = true;
        stringChar = ch;
      } else if (inString && ch === stringChar && str[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }

      if (!inString) {
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        if (ch === ')' || ch === ']' || ch === '}') depth--;
      }

      if (ch === ',' && depth === 0 && !inString) {
        args.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) args.push(current);
    return args;
  }

  evaluateCondition(expr) {
    expr = expr.trim();
    const result = this.evaluateExpression(expr);
    if (typeof result === 'boolean') return result;
    return !!result;
  }

  evaluateExpression(expr) {
    expr = expr.trim();
    if (expr === 'True' || expr === 'true') return true;
    if (expr === 'False' || expr === 'false') return false;
    if (expr === 'None' || expr === 'null' || expr === 'undefined') return null;

    if (!isNaN(expr) && expr !== '') return Number(expr);

    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    if (expr.startsWith('[') && expr.endsWith(']')) {
      return this.parseList(expr);
    }

    if (expr.startsWith('{') && expr.endsWith('}')) {
      return this.parseDict(expr);
    }

    const comparisonMatch = expr.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (comparisonMatch) {
      const left = this.evaluateExpression(comparisonMatch[1].trim());
      const op = comparisonMatch[2];
      const right = this.evaluateExpression(comparisonMatch[3].trim());
      switch (op) {
        case '==': return left == right;
        case '!=': return left != right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '>': return left > right;
        case '<': return left < right;
      }
    }

    const andMatch = expr.match(/(.+)\s+and\s+(.+)/i);
    if (andMatch) {
      const left = this.evaluateCondition(andMatch[1]);
      if (!left) return false;
      return this.evaluateCondition(andMatch[2]);
    }
    const andMatch2 = expr.match(/(.+)\s+&&\s+(.+)/);
    if (andMatch2) {
      const left = this.evaluateCondition(andMatch2[1]);
      if (!left) return false;
      return this.evaluateCondition(andMatch2[2]);
    }

    const orMatch = expr.match(/(.+)\s+or\s+(.+)/i);
    if (orMatch) {
      const left = this.evaluateCondition(orMatch[1]);
      if (left) return true;
      return this.evaluateCondition(orMatch[2]);
    }
    const orMatch2 = expr.match(/(.+)\s+\|\|\s+(.+)/);
    if (orMatch2) {
      const left = this.evaluateCondition(orMatch2[1]);
      if (left) return true;
      return this.evaluateCondition(orMatch2[2]);
    }

    const addMatch2 = expr.match(/^(.+?)\s*\+\s*(.+)$/);
    if (addMatch2) {
      const left = this.evaluateExpression(addMatch2[1].trim());
      const right = this.evaluateExpression(addMatch2[2].trim());
      if (typeof left === 'string' || typeof right === 'string') {
        return String(left) + String(right);
      }
      return Number(left) + Number(right);
    }

    const subMatch = expr.match(/^(.+?)\s*\-\s*(.+)$/);
    if (subMatch) {
      const left = this.evaluateExpression(subMatch[1].trim());
      const right = this.evaluateExpression(subMatch[2].trim());
      return Number(left) - Number(right);
    }

    const mulMatch = expr.match(/^(.+?)\s*\*\s*(.+)$/);
    if (mulMatch) {
      const left = this.evaluateExpression(mulMatch[1].trim());
      const right = this.evaluateExpression(mulMatch[2].trim());
      return Number(left) * Number(right);
    }

    const divMatch = expr.match(/^(.+?)\s*\/\s*(.+)$/);
    if (divMatch) {
      const left = this.evaluateExpression(divMatch[1].trim());
      const right = this.evaluateExpression(divMatch[2].trim());
      return Number(left) / Number(right);
    }

    if (expr.includes('(') && expr.endsWith(')')) {
      const parenIdx = expr.indexOf('(');
      const funcName = expr.slice(0, parenIdx).trim();
      const argsStr = expr.slice(parenIdx + 1, expr.lastIndexOf(')')).trim();
      const args = argsStr ? this.splitArgs(argsStr).map(a => this.evaluateExpression(a.trim())) : [];

      if (funcName === 'len' || funcName === 'length') {
        const val = args[0];
        if (Array.isArray(val)) return val.length;
        if (typeof val === 'string') return val.length;
        if (typeof val === 'object') return Object.keys(val).length;
        return 0;
      }
      if (funcName === 'int') return parseInt(args[0]) || 0;
      if (funcName === 'str') return String(args[0]);
      if (funcName === 'list') return Array.from(String(args[0]));
      if (funcName === 'range') return { type: 'range' };

      if (this.variables[funcName] && this.variables[funcName].type === 'function') {
        const funcObj = this.variables[funcName];
        const savedVars = { ...this.variables };
        for (let i = 0; i < funcObj.params.length; i++) {
          this.variables[funcObj.params[i]] = args[i] !== undefined ? args[i] : null;
        }
        try {
          this.executeBlock(funcObj.body);
          return null;
        } catch (e) {
          if (e && e.type === 'return') {
            this.variables = savedVars;
            return e.value;
          }
          throw e;
        }
      }
    }

    if (expr.includes('[') && expr.includes(']')) {
      const bracketIdx = expr.indexOf('[');
      const varName = expr.slice(0, bracketIdx).trim();
      const indexStr = expr.slice(bracketIdx + 1, expr.indexOf(']')).trim();
      const index = this.evaluateExpression(indexStr);
      const val = this.variables[varName];
      if (val !== undefined) {
        if (typeof val === 'string') return val[index];
        if (Array.isArray(val)) return val[index];
        if (typeof val === 'object') return val[index];
      }
      return undefined;
    }

    if (this.variables.hasOwnProperty(expr)) {
      const val = this.variables[expr];
      if (val && val.type === 'function') return val;
      return val;
    }

    return expr;
  }
}

const sandbox = new CodeSandbox();