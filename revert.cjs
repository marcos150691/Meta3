const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Wrapper
code = code.replace(
  /className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 max-w-7xl mx-auto"/g,
  'className="space-y-6 pt-2"'
);

// 2. Timer
code = code.replace(
  /className=\{`\$\{cardClass\} md:col-span-12 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden ring-1 ring-white\/10 rounded-xl shadow-md`\}/g,
  'className={`\\${cardClass} p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white/5`}'
);
code = code.replace(
  /className="w-full flex sm:flex-row flex-col justify-between items-center relative z-10 gap-4"/g,
  'className="flex justify-between items-center relative z-10"'
);

// 3. Count & Value Goals Wrapper + Count Goal
// Oh, the wrapper was entirely removed. I should insert the wrapper back before the Count Goal.
code = code.replace(
  /\{\/\* Count Goal \*\/\}\s*<div className=\{`\$\{cardClass\} md:col-span-4 p-4 sm:p-5 space-y-4 rounded-xl shadow-sm border border-white\/10`\}>/,
  `{/* Progress Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Count Goal */}
              <div className={\`\${cardClass} p-4 sm:p-6 space-y-4\`}>`
);

// Value goal
code = code.replace(
  /\{\/\* Value Goal \*\/\}\s*<div className=\{`\$\{cardClass\} md:col-span-4 p-4 sm:p-5 space-y-4 rounded-xl shadow-sm border border-white\/10`\}>/,
  `{/* Value Goal */}
              <div className={\`\${cardClass} p-4 sm:p-6 space-y-4\`}>`
);

// Vault Card - closing the progress cards grid and rendering vault
code = code.replace(
  /\{\/\* Vault Card \*\/\}\s*<div className=\{`\$\{cardClass\} md:col-span-4 p-4 sm:p-5 border-t-4 border-l-0 border-green-500 overflow-hidden relative flex flex-col justify-between rounded-xl shadow-sm border-x border-b border-white\/10`\}>/,
  `            </div>
            {/* Vault Card */}
            <div className={\`\${cardClass} p-4 sm:p-6 border-l-4 border-green-500 overflow-hidden relative\`}>`
);

// 4. Shift Breakdown
code = code.replace(
  /className="md:col-span-12 grid grid-cols-3 gap-2 sm:gap-4"/g,
  'className="grid grid-cols-3 gap-2 sm:gap-3"'
);
code = code.replace(
  /className=\{`\$\{cardClass\} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1 rounded-xl shadow-sm border border-white\/5`\}/g,
  'className={`\\${cardClass} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1`}'
);

// 5. Remove Action Buttons (Big Bento)
code = code.replace(
  /\{\/\* Big Action Button \(Bento\) \*\/\}[\s\S]*?\{\/\* Recent Rides \*\/\}/,
  '{/* Recent Rides */}'
);

// 6. Recent Rides
code = code.replace(
  /className="md:col-span-12 space-y-4 pt-4 border-t border-white\/10"/g,
  'className="space-y-4"'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Reverted to original layout');
