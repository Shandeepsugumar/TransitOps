import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ 
  columns, 
  data = [], 
  pagination, 
  onPageChange,
  isLoading,
  emptyMessage = "No records found"
}) => {
  return (
    <div className="bg-white border border-[#E5E5E7] rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#F7F7F8] border-b border-[#E5E5E7] text-[#6B6B70]">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 font-medium uppercase tracking-wider text-xs">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E7]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-[#6B6B70]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin"></div>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[#6B6B70]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#F7F7F8] transition-colors duration-150 group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-[#1C1C1E]">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#E5E5E7] flex items-center justify-between bg-white">
          <span className="text-sm text-[#6B6B70]">
            Showing page <span className="font-medium text-[#1C1C1E]">{pagination.page + 1}</span> of <span className="font-medium text-[#1C1C1E]">{pagination.totalPages}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="p-1 rounded-lg border border-[#E5E5E7] text-[#1C1C1E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F7F8] transition-colors bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
              // Simple sliding window for pagination
              let pageNum = pagination.page;
              if (pagination.totalPages <= 5) {
                pageNum = idx;
              } else if (pagination.page < 2) {
                pageNum = idx;
              } else if (pagination.page > pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 5 + idx;
              } else {
                pageNum = pagination.page - 2 + idx;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-[#D97706] text-white border border-[#D97706]'
                      : 'text-[#1C1C1E] border border-transparent hover:bg-[#F7F7F8] bg-white'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages - 1}
              className="p-1 rounded-lg border border-[#E5E5E7] text-[#1C1C1E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F7F8] transition-colors bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
