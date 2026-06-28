"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInstructions = exports.ExceptionInstructions = exports.SwitchInstructions = exports.SynchronizationInstructions = exports.TypeInstructions = exports.StackInstructions = exports.ComparisonInstructions = exports.ConversionInstructions = exports.BranchInstructions = exports.ArrayInstructions = exports.FieldInstructions = exports.InvokeInstructions = exports.StoreInstructions = exports.LoadInstructions = exports.ControlInstructions = exports.MathInstructions = exports.ConstantInstructions = void 0;
const constants_1 = require("./constants");
Object.defineProperty(exports, "ConstantInstructions", { enumerable: true, get: function () { return constants_1.ConstantInstructions; } });
const math_1 = require("./math");
Object.defineProperty(exports, "MathInstructions", { enumerable: true, get: function () { return math_1.MathInstructions; } });
const control_1 = require("./control");
Object.defineProperty(exports, "ControlInstructions", { enumerable: true, get: function () { return control_1.ControlInstructions; } });
const loads_1 = require("./loads");
Object.defineProperty(exports, "LoadInstructions", { enumerable: true, get: function () { return loads_1.LoadInstructions; } });
const stores_1 = require("./stores");
Object.defineProperty(exports, "StoreInstructions", { enumerable: true, get: function () { return stores_1.StoreInstructions; } });
const invoke_1 = require("./invoke");
Object.defineProperty(exports, "InvokeInstructions", { enumerable: true, get: function () { return invoke_1.InvokeInstructions; } });
const field_instructions_1 = require("./field-instructions");
Object.defineProperty(exports, "FieldInstructions", { enumerable: true, get: function () { return field_instructions_1.FieldInstructions; } });
const array_instructions_1 = require("./array-instructions");
Object.defineProperty(exports, "ArrayInstructions", { enumerable: true, get: function () { return array_instructions_1.ArrayInstructions; } });
const branch_instructions_1 = require("./branch-instructions");
Object.defineProperty(exports, "BranchInstructions", { enumerable: true, get: function () { return branch_instructions_1.BranchInstructions; } });
const conversion_instructions_1 = require("./conversion-instructions");
Object.defineProperty(exports, "ConversionInstructions", { enumerable: true, get: function () { return conversion_instructions_1.ConversionInstructions; } });
const comparison_instructions_1 = require("./comparison-instructions");
Object.defineProperty(exports, "ComparisonInstructions", { enumerable: true, get: function () { return comparison_instructions_1.ComparisonInstructions; } });
const stack_instructions_1 = require("./stack-instructions");
Object.defineProperty(exports, "StackInstructions", { enumerable: true, get: function () { return stack_instructions_1.StackInstructions; } });
const type_instructions_1 = require("./type-instructions");
Object.defineProperty(exports, "TypeInstructions", { enumerable: true, get: function () { return type_instructions_1.TypeInstructions; } });
const sync_instructions_1 = require("./sync-instructions");
Object.defineProperty(exports, "SynchronizationInstructions", { enumerable: true, get: function () { return sync_instructions_1.SynchronizationInstructions; } });
const switch_instructions_1 = require("./switch-instructions");
Object.defineProperty(exports, "SwitchInstructions", { enumerable: true, get: function () { return switch_instructions_1.SwitchInstructions; } });
const exception_instructions_1 = require("./exception-instructions");
Object.defineProperty(exports, "ExceptionInstructions", { enumerable: true, get: function () { return exception_instructions_1.ExceptionInstructions; } });
function initInstructions() {
}
exports.initInstructions = initInstructions;
//# sourceMappingURL=index.js.map