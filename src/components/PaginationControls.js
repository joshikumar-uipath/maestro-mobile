"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationControls = PaginationControls;
const jsx_runtime_1 = require("react/jsx-runtime");
function PaginationControls({ hasNextPage, hasPreviousPage, onNext, onPrevious, isLoading, totalCount, itemCount, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500", children: totalCount !== undefined ? `${itemCount} of ${totalCount}` : `${itemCount} items` }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onPrevious, disabled: !hasPreviousPage || isLoading, className: "px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100", children: "Previous" }), (0, jsx_runtime_1.jsx)("button", { onClick: onNext, disabled: !hasNextPage || isLoading, className: "px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100", children: "Next" })] })] }));
}
//# sourceMappingURL=PaginationControls.js.map