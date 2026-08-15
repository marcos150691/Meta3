const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Wrapper
code = code.replace(
  /className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2"/g,
  'className="flex flex-col gap-8 pt-6 max-w-2xl mx-auto"'
);

// 2. Timer
code = code.replace(
  /className=\{`\$\{cardClass\} col-span-2 lg:col-span-4 p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white\/5`\}/g,
  'className={`\\${cardClass} w-full p-6 sm:p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden ring-2 ring-white/10 rounded-[2rem] shadow-2xl scale-105`}'
);

// 3. Count & Value Goals (replace both)
code = code.replace(
  /className=\{`\$\{cardClass\} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4`\}/g,
  'className={`\\${cardClass} w-full p-6 sm:p-8 space-y-6 rounded-[2rem] shadow-xl`}'
);

// 4. Vault
code = code.replace(
  /className=\{`\$\{cardClass\} col-span-2 lg:col-span-2 p-4 sm:p-6 border-l-4 border-green-500 overflow-hidden relative flex flex-col justify-between`\}/g,
  'className={`\\${cardClass} w-full p-6 sm:p-8 border-l-8 border-green-500 overflow-hidden relative flex flex-col justify-between rounded-[2rem] shadow-xl`}'
);

// 5. Shift Breakdown
code = code.replace(
  /className="col-span-2 lg:col-span-2 grid grid-cols-3 gap-2 sm:gap-3"/g,
  'className="w-full grid grid-cols-3 gap-3 sm:gap-4"'
);

// 6. Action Buttons
code = code.replace(
  /className="col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-2"/g,
  'className="w-full grid grid-cols-1 gap-4 my-4"'
);

// 7. Recent Rides
code = code.replace(
  /className="col-span-2 lg:col-span-4 space-y-4"/g,
  'className="w-full space-y-6 pt-4"'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched for Layout 2');
