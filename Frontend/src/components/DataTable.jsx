import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronsUpDown } from 'lucide-react';

const DataTable = ({ columns, data = [], isLoading, emptyMessage = "No data available" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return columns.some(col => {
        const val = item[col.accessor];
        if (val == null) return false;
        return String(val).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {columns.map((_, j) => (
            <div key={j} className="h-6 bg-neutral-200 rounded w-full"></div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:bg-neutral-100' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable !== false && (
                      <ChevronsUpDown className="w-3 h-3 text-neutral-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>{renderSkeleton()}</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((row, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-black">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between bg-white">
          <span className="text-sm text-neutral-500">
            Showing <span className="font-medium text-black">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-black">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-black">{sortedData.length}</span> results
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-neutral-200 text-black hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 text-black hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
