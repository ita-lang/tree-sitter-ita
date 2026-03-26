/// tree-sitter grammar for the Glu programming language

module.exports = grammar({
  name: 'glu',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.return_statement],
    [$.parameter, $._expression],
    [$.closure_expression, $.assignment_expression],
    [$.closure_expression, $.where_expression],
    [$.closure_expression, $.copy_with_expression],
  ],

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.function_declaration,
      $.async_function_declaration,
      $.stream_function_declaration,
      $.struct_declaration,
      $.class_declaration,
      $.enum_declaration,
      $.trait_declaration,
      $.impl_declaration,
      $.extension_declaration,
      $.actor_declaration,
      $.operator_declaration,
      $.import_declaration,
      $._statement,
    ),

    // === Functions ===

    function_declaration: $ => seq(
      optional($.pub_modifier),
      'fn',
      field('name', $.identifier),
      optional($.generic_params),
      $.parameter_list,
      optional(seq('->', $._type)),
      choice($.block, seq('=>', $._expression)),
    ),

    async_function_declaration: $ => seq(
      optional($.pub_modifier),
      'async',
      'fn',
      field('name', $.identifier),
      $.parameter_list,
      optional(seq('->', $._type)),
      choice($.block, seq('=>', $._expression)),
    ),

    stream_function_declaration: $ => seq(
      optional($.pub_modifier),
      'stream',
      'fn',
      field('name', $.identifier),
      $.parameter_list,
      optional(seq('->', $._type)),
      $.block,
    ),

    // === Types ===

    struct_declaration: $ => seq(
      optional($.pub_modifier),
      'struct',
      field('name', $.identifier),
      optional($.generic_params),
      '{',
      repeat($.field_declaration),
      repeat($.function_declaration),
      '}',
    ),

    class_declaration: $ => seq(
      optional($.pub_modifier),
      'class',
      field('name', $.identifier),
      optional($.generic_params),
      optional(seq(':', $.identifier)),
      '{',
      repeat(choice($.field_declaration, $.function_declaration, $.init_declaration)),
      '}',
    ),

    enum_declaration: $ => seq(
      optional($.pub_modifier),
      'enum',
      field('name', $.identifier),
      optional($.generic_params),
      '{',
      commaSep($.enum_variant),
      optional(','),
      repeat($.function_declaration),
      '}',
    ),

    trait_declaration: $ => seq(
      optional($.pub_modifier),
      'trait',
      field('name', $.identifier),
      optional($.generic_params),
      '{',
      repeat(choice($.function_declaration, $.function_signature)),
      '}',
    ),

    function_signature: $ => seq(
      optional($.pub_modifier),
      'fn',
      field('name', $.identifier),
      optional($.generic_params),
      $.parameter_list,
      optional(seq('->', $._type)),
    ),

    impl_declaration: $ => seq(
      'impl',
      $.identifier,
      'for',
      $._type,
      '{',
      repeat($.function_declaration),
      '}',
    ),

    extension_declaration: $ => seq(
      'extension',
      $.identifier,
      optional(seq(':', commaSep1($.identifier))),
      '{',
      repeat($.function_declaration),
      '}',
    ),

    actor_declaration: $ => seq(
      optional($.pub_modifier),
      'actor',
      field('name', $.identifier),
      '{',
      repeat(choice($.field_declaration, $.function_declaration, $.stream_function_declaration)),
      '}',
    ),

    operator_declaration: $ => seq(
      'operator',
      $._operator,
      $.parameter_list,
      '->',
      $._type,
      $.block,
    ),

    import_declaration: $ => choice(
      seq('import', '{', commaSep1($.import_member), '}', 'from', $.string_literal),
      seq('import', '*', 'as', $.identifier, 'from', $.string_literal),
      seq('import', $.string_literal),
    ),

    import_member: $ => seq(
      $.identifier,
      optional(seq('as', $.identifier)),
    ),

    init_declaration: $ => seq(
      'init',
      $.parameter_list,
      $.block,
    ),

    // === Helpers ===

    pub_modifier: $ => 'pub',

    field_declaration: $ => seq(
      optional(choice('let', 'var')),
      field('name', $.identifier),
      ':',
      $._type,
      optional(seq('=', $._expression)),
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(seq('(', commaSep($.parameter), ')')),
    ),

    parameter_list: $ => seq('(', commaSep($.parameter), optional(seq(';', commaSep1($.parameter))), ')'),

    parameter: $ => seq(
      optional(field('label', $.identifier)),
      field('name', $.identifier),
      optional(seq(':', $._type)),
      optional(seq('=', $._expression)),
    ),

    generic_params: $ => seq('<', commaSep1($.generic_param), '>'),

    generic_param: $ => seq(
      $.identifier,
      optional(seq(':', $._type)),
    ),

    // === Types ===

    _type: $ => choice(
      $.named_type,
      $.optional_type,
      $.function_type,
      $.mut_type,
    ),

    named_type: $ => prec.left(seq(
      $.identifier,
      optional(seq('<', commaSep1($._type), '>')),
    )),

    optional_type: $ => prec(2, seq($._type, '?')),
    function_type: $ => seq('(', commaSep($._type), ')', '->', $._type),
    mut_type: $ => seq('mut', $._type),

    // === Statements ===

    _statement: $ => choice(
      $.let_statement,
      $.var_statement,
      $.return_statement,
      $.if_statement,
      $.guard_statement,
      $.while_statement,
      $.for_statement,
      $.for_await_statement,
      $.emit_statement,
      $.expression_statement,
      $.block,
    ),

    block: $ => seq('{', repeat($._statement), '}'),

    let_statement: $ => seq(
      'let',
      choice(
        seq(field('pattern', choice($.destructure_object, $.destructure_array)), '=', $._expression),
        seq(field('name', $.identifier), optional(seq(':', $._type)), optional(seq('=', $._expression))),
      ),
    ),

    var_statement: $ => seq(
      'var',
      field('name', $.identifier),
      optional(seq(':', $._type)),
      optional(seq('=', $._expression)),
    ),

    return_statement: $ => seq('return', optional($._expression)),

    if_statement: $ => seq(
      'if',
      choice(
        seq('let', $.identifier, '=', $._expression),
        $._expression,
      ),
      $.block,
      optional(seq('else', choice($.if_statement, $.block))),
    ),

    guard_statement: $ => seq(
      'guard',
      choice(
        seq('let', $.identifier, '=', $._expression, optional(seq('&&', $._expression))),
        $._expression,
      ),
      'else',
      $.block,
    ),

    while_statement: $ => seq('while', $._expression, $.block),
    for_statement: $ => seq('for', $.identifier, 'in', $._expression, $.block),
    for_await_statement: $ => seq('for', 'await', $.identifier, 'in', $._expression, $.block),
    emit_statement: $ => seq('emit', $._expression),
    expression_statement: $ => $._expression,

    destructure_object: $ => seq('{', commaSep1($.identifier), '}'),
    destructure_array: $ => seq('[', commaSep1(choice($.identifier, $.rest_pattern)), ']'),
    rest_pattern: $ => seq('..', optional($.identifier)),

    // === Expressions ===

    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.index_expression,
      $.match_expression,
      $.closure_expression,
      $.await_expression,
      $.await_all_expression,
      $.spawn_expression,
      $.pipe_expression,
      $.range_expression,
      $.assignment_expression,
      $.where_expression,
      $.try_expression,
      $.panic_expression,
      $.identifier,
      $.integer_literal,
      $.float_literal,
      $.string_literal,
      $.multiline_string,
      $.boolean_literal,
      $.nil_literal,
      $.list_literal,
      $.enum_access,
      $.copy_with_expression,
      $.parenthesized_expression,
    ),

    binary_expression: $ => choice(
      ...['||', '&&', '==', '!=', '<', '>', '<=', '>=',
          '+', '-', '*', '/', '%', '**', '??', '>>'].map(op =>
        prec.left(op === '**' ? 10 : op === '??' ? 1 : 5,
          seq($._expression, op, $._expression))
      ),
    ),

    unary_expression: $ => choice(
      prec(11, seq('-', $._expression)),
      prec(11, seq('!', $._expression)),
      prec(11, seq('~', $._expression)),
    ),

    call_expression: $ => prec.left(12, seq(
      $._expression,
      '(',
      commaSep($.argument),
      ')',
      optional($.trailing_closure),
    )),

    argument: $ => seq(
      optional(seq(field('label', $.identifier), ':')),
      $._expression,
    ),

    trailing_closure: $ => $.block,

    member_expression: $ => prec.left(12, seq($._expression, '.', $.identifier)),
    index_expression: $ => prec(12, seq($._expression, '[', $._expression, ']')),

    match_expression: $ => seq('match', $._expression, '{', repeat($.match_arm), '}'),
    match_arm: $ => seq(
      $._pattern,
      optional(seq('if', $._expression)),
      '=>',
      $._expression,
      optional(','),
    ),

    closure_expression: $ => seq(
      '(', commaSep($.parameter), ')',
      optional(seq('->', $._type)),
      choice(
        seq('=>', choice($.block, $._expression)),
        $.block,
      ),
    ),

    await_expression: $ => prec(11, seq('await', $._expression)),
    await_all_expression: $ => seq('await', 'all', '(', commaSep($._expression), ')'),
    spawn_expression: $ => prec(11, seq('spawn', $._expression)),
    pipe_expression: $ => prec.left(2, seq($._expression, '|>', $._expression)),
    range_expression: $ => prec.left(4, seq($._expression, choice('..', '..='), $._expression)),
    assignment_expression: $ => prec.right(0, seq($._expression, choice('=', '+=', '-=', '*=', '/='), $._expression)),
    where_expression: $ => seq($._expression, 'where', $.block),
    try_expression: $ => prec(13, seq($._expression, '?')),
    panic_expression: $ => seq('panic', '(', $._expression, ')'),

    parenthesized_expression: $ => seq('(', $._expression, ')'),
    enum_access: $ => prec.left(seq('.', $.identifier, optional(seq('(', commaSep($._expression), ')')))),
    list_literal: $ => seq('[', commaSep($._expression), ']'),
    copy_with_expression: $ => seq($._expression, '.{', commaSep(seq($.identifier, ':', $._expression)), '}'),

    // === Patterns ===

    _pattern: $ => choice(
      $.wildcard_pattern,
      $.identifier_pattern,
      $.literal_pattern,
      $.enum_pattern,
      $.list_pattern,
      $.struct_pattern,
    ),

    wildcard_pattern: $ => '_',
    identifier_pattern: $ => $.identifier,
    literal_pattern: $ => choice($.integer_literal, $.float_literal, $.string_literal, $.boolean_literal, $.nil_literal),
    enum_pattern: $ => seq('.', $.identifier, optional(seq('(', commaSep($._pattern), ')'))),
    list_pattern: $ => seq('[', commaSep(choice($._pattern, $.rest_pattern)), ']'),
    struct_pattern: $ => seq($.identifier, '{', commaSep(seq($.identifier, optional(seq(':', $._pattern)))), '}'),

    // === Operators ===

    _operator: $ => choice('+', '-', '*', '/', '%', '**', '==', '!=', '<', '>', '<=', '>='),

    // === Literals ===

    integer_literal: $ => choice(
      /[0-9][0-9_]*/,
      /0[xX][0-9a-fA-F][0-9a-fA-F_]*/,
      /0[bB][01][01_]*/,
    ),
    float_literal: $ => /[0-9][0-9_]*\.[0-9][0-9_]*([eE][+-]?[0-9]+)?/,
    string_literal: $ => seq('"', repeat(choice(/[^"\\$]+/, $.escape_sequence, $.string_interpolation)), '"'),
    multiline_string: $ => seq('"""', repeat(choice(/[^"]+/, /"[^"]/, /""[^"]/)), '"""'),
    escape_sequence: $ => /\\[nrt\\"0]/,
    string_interpolation: $ => seq('${', $._expression, '}'),
    boolean_literal: $ => choice('true', 'false'),
    nil_literal: $ => 'nil',

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    shorthand_param: $ => /\$[0-9]+/,

    // === Comments ===

    line_comment: $ => /\/\/[^\n]*/,
    block_comment: $ => seq('/*', repeat(choice(/[^*]+/, /\*[^/]/)), '*/'),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
