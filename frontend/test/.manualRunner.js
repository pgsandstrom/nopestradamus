// This is only used for running the tests from inside an IDE (so breakpoints etc can easily be used).
// Run this as a mocha file!

// Node might require this option for breakpoints to work: --expose_debug_as=v8debug
// Mocha will require this option: --compilers css:./test/null-compiler

require('./.setup');
require('./settingsMenu-test');
