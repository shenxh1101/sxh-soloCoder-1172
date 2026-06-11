const KNOWLEDGE_CARDS = {
  python_print: {
    id: 'python_print',
    title: 'Python print() 函数',
    summary: 'print() 是 Python 中最基本的输出函数，用于在控制台显示信息。',
    detail: 'print() 函数接受一个或多个参数，将它们转换为字符串并输出到控制台。字符串必须用成对的引号（单引号或双引号）括起来。如果引号不匹配，Python 会抛出 SyntaxError。',
    correctExample: 'print("Hello, World!")\nprint(\'Python is fun!\')',
    wrongExample: 'print("Hello, World!)\nprint(\'Python is fun!)'
  },
  js_variable: {
    id: 'js_variable',
    title: 'JavaScript 变量声明',
    summary: '在 JavaScript 中，使用变量前必须先声明。',
    detail: '使用 let、const 或 var 关键字声明变量。如果尝试使用未声明的变量，JavaScript 会抛出 ReferenceError。ES6 推荐使用 let（可变）和 const（不可变）。',
    correctExample: 'let name = "Alice";\nconsole.log(name);',
    wrongExample: 'console.log(name);\n// ReferenceError: name is not defined'
  },
  python_indent: {
    id: 'python_indent',
    title: 'Python 缩进规则',
    summary: 'Python 使用缩进（空格或制表符）来定义代码块，而不是花括号。',
    detail: '在 if、for、while、def、class 等语句后，下一行必须缩进（通常4个空格）。缩进不一致或缺少缩进会导致 IndentationError。同一代码块中的所有行必须使用相同的缩进级别。',
    correctExample: 'if x > 5:\n    print("大于5")\nelse:\n    print("小于等于5")',
    wrongExample: 'if x > 5:\nprint("大于5")\n# IndentationError!'
  },
  js_brackets: {
    id: 'js_brackets',
    title: 'JavaScript 括号匹配',
    summary: 'JavaScript 中所有括号必须成对出现。',
    detail: '圆括号 () 用于函数定义和调用、条件表达式等。花括号 {} 用于代码块、对象字面量。方括号 [] 用于数组、属性访问。每个左括号必须有一个对应的右括号，否则会抛出 SyntaxError。',
    correctExample: 'function add(a, b) {\n  return a + b;\n}',
    wrongExample: 'function add(a, b {\n  return a + b;\n}\n// 缺少 )'
  },
  python_list: {
    id: 'python_list',
    title: 'Python 列表语法',
    summary: '列表是 Python 中最常用的数据结构之一。',
    detail: '列表使用方括号 [] 定义，元素之间用逗号分隔。方括号必须成对出现。列表可以包含不同类型的元素，支持索引访问、切片、追加等操作。',
    correctExample: 'fruits = ["apple", "banana", "orange"]\nprint(fruits[0])',
    wrongExample: 'fruits = ["apple", "banana", "orange"\n# SyntaxError: 缺少 ]'
  },
  js_for_loop: {
    id: 'js_for_loop',
    title: 'JavaScript for 循环',
    summary: 'for 循环用于重复执行一段代码。',
    detail: '标准 for 循环有三个部分：初始化、条件、迭代语句，用分号分隔。循环体用花括号 {} 包裹。如果循环体只有一行，花括号可以省略但不推荐。for 循环的圆括号必须完整闭合。',
    correctExample: 'for (let i = 0; i < 3; i++) {\n  console.log(i);\n}',
    wrongExample: 'for (let i = 0; i < 3; i++)\n  console.log(i);\n// 缺少 {} 虽然语法正确，但容易出错'
  },
  python_dict: {
    id: 'python_dict',
    title: 'Python 字典与字符串',
    summary: '字典使用花括号，字符串使用引号。注意不要混淆。',
    detail: '字典使用 {} 定义键值对。字符串必须用引号包裹。在字典中，键和值如果是字符串类型都需要引号。常见错误是忘记闭合引号或括号。',
    correctExample: 'person = {"name": "Alice", "age": 25}\nprint(person["name"])',
    wrongExample: 'person = {"name": "Alice", "age": 25\n# SyntaxError: 缺少 }'
  },
  js_array_methods: {
    id: 'js_array_methods',
    title: 'JavaScript 数组方法链式调用',
    summary: '数组方法可以链式调用，但要确保每个方法返回数组。',
    detail: 'map()、filter()、forEach() 等数组方法可以链式调用。链式调用时注意每个中间结果的数据类型。使用未定义的变量作为数组会导致 TypeError。',
    correctExample: 'let arr = [1, 2, 3];\nlet result = arr.map(x => x * 2).filter(x => x > 3);\nconsole.log(result);',
    wrongExample: 'let result = arr.map(x => x * 2);\n// ReferenceError: arr is not defined'
  },
  python_function: {
    id: 'python_function',
    title: 'Python 函数定义与调用',
    summary: '函数使用 def 关键字定义，调用时需传入正确数量的参数。',
    detail: '函数定义使用 def 关键字，后跟函数名、参数列表（在圆括号中）和冒号。函数体必须缩进。调用时参数数量必须与定义匹配，否则抛出 TypeError。',
    correctExample: 'def greet(name):\n    return "Hello, " + name\n\nprint(greet("World"))',
    wrongExample: 'def greet(name):\nreturn "Hello, " + name\n# IndentationError!'
  },
  js_conditionals: {
    id: 'js_conditionals',
    title: 'JavaScript 条件判断与逻辑运算',
    summary: 'if/else 语句控制程序流程，圆括号和花括号必须正确使用。',
    detail: 'if 语句的条件表达式放在圆括号 () 中，执行体放在花括号 {} 中。逻辑运算符 &&（与）、||（或）、!（非）用于组合条件。注意括号嵌套时每一层都要正确闭合。',
    correctExample: 'let x = 10;\nif (x > 5 && x < 20) {\n  console.log("在范围内");\n}',
    wrongExample: 'let x = 10;\nif (x > 5 && x < 20 {\n  console.log("在范围内");\n}\n// 缺少 )'
  }
};

const LEVELS = [
  {
    id: 1,
    title: '引号迷踪',
    language: 'python',
    difficulty: 1,
    knowledgePoint: 'print函数基本用法',
    knowledgeId: 'python_print',
    buggyCode: 'print("Hello, World!)',
    correctCode: 'print("Hello, World!")',
    options: [
      'print("Hello, World!")',
      'print(Hello, World!)',
      'print("Hello, World!',
      'Print("Hello, World!")'
    ],
    correctIndex: 0,
    errorLine: 1,
    errorType: '字符串引号未闭合',
    expectedOutput: 'Hello, World!'
  },
  {
    id: 2,
    title: '消失的变量',
    language: 'javascript',
    difficulty: 1,
    knowledgePoint: '变量声明',
    knowledgeId: 'js_variable',
    buggyCode: 'console.log(message);',
    correctCode: 'let message = "Hello, JavaScript!";\nconsole.log(message);',
    options: [
      'let message = "Hello, JavaScript!";\nconsole.log(message);',
      'console.log("message");',
      'console.log(let message);',
      'message = "Hello";\nconsole.log(message);'
    ],
    correctIndex: 0,
    errorLine: 1,
    errorType: '变量未定义',
    expectedOutput: 'Hello, JavaScript!'
  },
  {
    id: 3,
    title: '缩进考验',
    language: 'python',
    difficulty: 2,
    knowledgePoint: 'if语句缩进',
    knowledgeId: 'python_indent',
    buggyCode: 'x = 10\nif x > 5:\nprint("x is greater than 5")',
    correctCode: 'x = 10\nif x > 5:\n    print("x is greater than 5")',
    options: [
      'x = 10\nif x > 5:\n    print("x is greater than 5")',
      'x = 10\nif x > 5:\nprint("x is greater than 5")',
      'x = 10\nif x > 5\n    print("x is greater than 5")',
      'x = 10\nif (x > 5):\n    print("x is greater than 5")'
    ],
    correctIndex: 0,
    errorLine: 3,
    errorType: '缩进错误',
    expectedOutput: 'x is greater than 5'
  },
  {
    id: 4,
    title: '消失的括号',
    language: 'javascript',
    difficulty: 2,
    knowledgePoint: '函数参数括号',
    knowledgeId: 'js_brackets',
    buggyCode: 'function add(a, b {\n  return a + b;\n}\nconsole.log(add(3, 5));',
    correctCode: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 5));',
    options: [
      'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 5));',
      'function add(a, b {\n  return a + b;\n}\nconsole.log(add(3, 5));',
      'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 5)',
      'function add(a, b) {\n  return a + b;\nconsole.log(add(3, 5));'
    ],
    correctIndex: 0,
    errorLine: 1,
    errorType: '括号不匹配',
    expectedOutput: '8'
  },
  {
    id: 5,
    title: '列表缺口',
    language: 'python',
    difficulty: 2,
    knowledgePoint: '列表操作',
    knowledgeId: 'python_list',
    buggyCode: 'fruits = ["apple", "banana", "orange"\nprint(fruits[0])',
    correctCode: 'fruits = ["apple", "banana", "orange"]\nprint(fruits[0])',
    options: [
      'fruits = ["apple", "banana", "orange"]\nprint(fruits[0])',
      'fruits = ["apple", "banana", "orange"\nprint(fruits[0])',
      'fruits = "apple", "banana", "orange"\nprint(fruits[0])',
      'fruits = ["apple", "banana", "orange"]\nprint(fruits[1])'
    ],
    correctIndex: 0,
    errorLine: 1,
    errorType: '括号不匹配',
    expectedOutput: 'apple'
  },
  {
    id: 6,
    title: '循环迷局',
    language: 'javascript',
    difficulty: 3,
    knowledgePoint: 'for循环语法',
    knowledgeId: 'js_for_loop',
    buggyCode: 'for (let i = 0; i < 3; i++)\n  console.log("Count: " + i);\n  console.log("Done!");',
    correctCode: 'for (let i = 0; i < 3; i++) {\n  console.log("Count: " + i);\n  console.log("Done!");\n}',
    options: [
      'for (let i = 0; i < 3; i++) {\n  console.log("Count: " + i);\n  console.log("Done!");\n}',
      'for (let i = 0; i < 3; i++)\n  console.log("Count: " + i);\n  console.log("Done!");',
      'for (let i = 0; i < 3; i++) {\n  console.log("Count: " + i);\n}\nconsole.log("Done!");',
      'for (let i = 0; i < 3; i++) {\n  console.log("Done!");\n  console.log("Count: " + i);\n}'
    ],
    correctIndex: 0,
    errorLine: 2,
    errorType: '缺少花括号导致逻辑错误',
    expectedOutput: 'Count: 0\nDone!\nCount: 1\nDone!\nCount: 2\nDone!'
  },
  {
    id: 7,
    title: '字典陷阱',
    language: 'python',
    difficulty: 3,
    knowledgePoint: '字典与字符串拼接',
    knowledgeId: 'python_dict',
    buggyCode: 'person = {"name": "Alice", "age": 25\nprint("Name: " + person["name"])',
    correctCode: 'person = {"name": "Alice", "age": 25}\nprint("Name: " + person["name"])',
    options: [
      'person = {"name": "Alice", "age": 25}\nprint("Name: " + person["name"])',
      'person = {"name": "Alice, "age": 25}\nprint("Name: " + person["name"])',
      'person = {"name": "Alice", "age": 25\nprint("Name: " + person["name"])',
      'person = {"name": "Alice", "age": 25}\nprint("Name: " + person["name"]'
    ],
    correctIndex: 0,
    errorLine: 1,
    errorType: '字典花括号未闭合',
    expectedOutput: 'Name: Alice'
  },
  {
    id: 8,
    title: '数组迷踪',
    language: 'javascript',
    difficulty: 3,
    knowledgePoint: '数组方法链式调用',
    knowledgeId: 'js_array_methods',
    buggyCode: 'let result = numbers.map(x => x * 2);\nconsole.log(result);',
    correctCode: 'let numbers = [1, 2, 3];\nlet result = numbers.map(x => x * 2);\nconsole.log(result);',
    options: [
      'let numbers = [1, 2, 3];\nlet result = numbers.map(x => x * 2);\nconsole.log(result);',
      'let result = numbers.map(x => x * 2);\nconsole.log(result);',
      'let numbers = [1, 2, 3];\nlet result = numbers.map(x => x * 2);\nconsole.log(result)',
      'let numbers = [1, 2, 3];\nlet result = numbers.map(x => x * 2);\nconsole.log(numbers);'
    ],
    correctIndex: 0,
    errorLine: 1,
    errorType: '变量未定义',
    expectedOutput: '2,4,6'
  },
  {
    id: 9,
    title: '函数工坊',
    language: 'python',
    difficulty: 4,
    knowledgePoint: '函数定义与调用',
    knowledgeId: 'python_function',
    buggyCode: 'def calculate(a, b):\nreturn a * b + 10\n\nresult = calculate(3, 4)\nprint(result)',
    correctCode: 'def calculate(a, b):\n    return a * b + 10\n\nresult = calculate(3, 4)\nprint(result)',
    options: [
      'def calculate(a, b):\n    return a * b + 10\n\nresult = calculate(3, 4)\nprint(result)',
      'def calculate(a, b):\nreturn a * b + 10\n\nresult = calculate(3, 4)\nprint(result)',
      'def calculate(a, b)\n    return a * b + 10\n\nresult = calculate(3, 4)\nprint(result)',
      'def calculate(a, b):\n    return a * b + 10\n\nresult = calculate(3 4)\nprint(result)'
    ],
    correctIndex: 0,
    errorLine: 2,
    errorType: '缩进错误',
    expectedOutput: '22'
  },
  {
    id: 10,
    title: '条件深渊',
    language: 'javascript',
    difficulty: 4,
    knowledgePoint: '条件判断与逻辑运算',
    knowledgeId: 'js_conditionals',
    buggyCode: 'let score = 85;\nif (score >= 90) {\n  console.log("优秀");\n} else if (score >= 60 && score < 90 {\n  console.log("及格");\n} else {\n  console.log("不及格");\n}',
    correctCode: 'let score = 85;\nif (score >= 90) {\n  console.log("优秀");\n} else if (score >= 60 && score < 90) {\n  console.log("及格");\n} else {\n  console.log("不及格");\n}',
    options: [
      'let score = 85;\nif (score >= 90) {\n  console.log("优秀");\n} else if (score >= 60 && score < 90) {\n  console.log("及格");\n} else {\n  console.log("不及格");\n}',
      'let score = 85;\nif (score >= 90) {\n  console.log("优秀");\n} else if (score >= 60 && score < 90 {\n  console.log("及格");\n} else {\n  console.log("不及格");\n}',
      'let score = 85;\nif (score >= 90) {\n  console.log("优秀");\n} else if (score >= 60) {\n  console.log("及格");\n} else {\n  console.log("不及格");\n}',
      'let score = 85;\nif (score >= 90) {\n  console.log("优秀")\n} else if (score >= 60 && score < 90) {\n  console.log("及格");\n} else {\n  console.log("不及格");\n}'
    ],
    correctIndex: 0,
    errorLine: 4,
    errorType: '括号不匹配',
    expectedOutput: '及格'
  }
];