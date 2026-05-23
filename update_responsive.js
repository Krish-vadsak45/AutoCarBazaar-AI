/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
let content = fs.readFileSync('src/app/compare/page.tsx', 'utf8');

// 1. Tweak the header text sizes
content = content.replace(
  '<h1 className="text-xl lg:text-5xl font-black tracking-tight',
  '<h1 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight'
);

// 2. Adjust AI Widget padding on mobile
content = content.replace(
  'className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.75rem] p-8 md:w-1/3 relative overflow-hidden',
  'className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.75rem] p-6 lg:p-8 md:w-1/3 relative overflow-hidden'
);
content = content.replace(
  'className="p-8 md:w-2/3 flex items-center bg-transparent"',
  'className="p-6 lg:p-8 md:w-2/3 flex items-center bg-transparent"'
);

// 3. Transform "The Matrix Setup" container into a horizontally scrollable area enforcing a desktop-like grid width on mobile
content = content.replace(
  /<div className="mt-12">\n\s*{\/\* Sticky Image Headers Grid \*\/}\n\s*<div className="grid grid-cols-\[1fr\] sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 sticky top-4 z-40">\n\s*{\/\* First Cell is empty on desktop, handles header layout \*\/}\n\s*<div className="hidden lg:flex flex-col justify-end bg-transparent p-6 rounded-3xl">/,
  `<div className="mt-12 overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[900px] lg:min-w-full">
          {/* Sticky Image Headers Grid */}
          <div className="grid grid-cols-4 gap-4 lg:gap-6 mb-8 sticky top-4 z-40">
            {/* First Cell is empty on desktop, handles header layout */}
            <div className="flex flex-col justify-end bg-transparent p-4 lg:p-6 rounded-3xl">`
);

// 4. Update elements to show properly on small screens within the enforced wide wrapper
content = content.replace(
  /className="hidden sm:flex flex-col items-center justify-center bg-gray-100\/50 dark:bg-slate-800\/20 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-slate-700\/50 rounded-3xl p-6 h-\[380px\]"/g,
  'className="flex flex-col items-center justify-center bg-gray-100/50 dark:bg-slate-800/20 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-slate-700/50 rounded-3xl p-4 lg:p-6 h-[380px]"'
);

content = content.replace(
  /className="grid grid-cols-\[1fr\] sm:grid-cols-2 lg:grid-cols-4 hover:bg-white dark:hover:bg-slate-800\/40 transition-colors"/g,
  'className="grid grid-cols-4 hover:bg-white dark:hover:bg-slate-800/40 transition-colors"'
);

content = content.replace(
  /className="grid grid-cols-\[1fr\] sm:grid-cols-2 lg:grid-cols-4 hover:bg-white dark:hover:bg-slate-800\/40 transition-colors group"/g,
  'className="grid grid-cols-4 hover:bg-white dark:hover:bg-slate-800/40 transition-colors group"'
);

content = content.replace(
  /className="p-6 md:p-8 flex items-center lg:col-span-1"/g,
  'className="p-4 lg:p-8 flex items-center col-span-1"'
);

content = content.replace(
  /className="p-6 md:p-8 flex items-center lg:border-l border-gray-100 dark:border-white\/5 text-lg font-semibold text-slate-900 dark:text-gray-200"/g,
  'className="p-4 lg:p-8 flex items-center border-l border-gray-100 dark:border-white/5 text-base lg:text-lg font-semibold text-slate-900 dark:text-gray-200"'
);

content = content.replace(
  /className="p-6 md:p-8 flex items-center lg:border-l border-gray-100 dark:border-white\/5"/g,
  'className="p-4 lg:p-8 flex items-center border-l border-gray-100 dark:border-white/5"'
);

content = content.replace(
  /className="hidden sm:block p-6 md:p-8 lg:border-l border-gray-100 dark:border-white\/5 bg-gray-50\/20 dark:bg-black\/10"/g,
  'className="block p-4 lg:p-8 border-l border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-black/10"'
);

// 5. Append the extra closing div dynamically by replacing the final structure
content = content.replace(
  /          <\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/,
  '          </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/app/compare/page.tsx', content);
console.log('Responsive refactor complete.');
