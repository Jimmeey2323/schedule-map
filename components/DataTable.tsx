import React, { useState, useMemo } from 'react';
// FIX: Import ClassSchedule type to resolve module export error.
import type { ClassSchedule } from '../types';

interface DataTableProps {
  data: ClassSchedule[];
}

type SortConfig = {
  key: keyof ClassSchedule;
  direction: 'ascending' | 'descending';
} | null;

const useSortableData = (items: ClassSchedule[], config: SortConfig = null) => {
    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (config !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[config.key];
                const valB = b[config.key];

                if (config.key === 'date') {
                  const dateA = new Date(valA || 0).getTime();
                  const dateB = new Date(valB || 0).getTime();
                  if (dateA < dateB) return config.direction === 'ascending' ? -1 : 1;
                  if (dateA > dateB) return config.direction === 'ascending' ? 1 : -1;
                  return 0;
                }

                if (valA === null || valA < valB) {
                    return config.direction === 'ascending' ? -1 : 1;
                }
                if (valB === null || valA > valB) {
                    return config.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, config]);
    
    return sortedItems;
};


export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, filter]);

  const sortedData = useSortableData(filteredData, sortConfig);
  
  const requestSort = (key: keyof ClassSchedule) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSortIcon = (key: keyof ClassSchedule) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 opacity-30 group-hover:opacity-100"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>;
    }
    return sortConfig.direction === 'ascending' ? 
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1"><path d="m18 15-6-6-6 6"/></svg> :
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1"><path d="m6 9 6 6 6-6"/></svg>;
  };

  const headers: { key: keyof ClassSchedule; label: string }[] = [
    { key: 'date', label: 'Date' },
    { key: 'day', label: 'Day' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'className', label: 'Class' },
    { key: 'trainer1', label: 'Trainer 1' },
    { key: 'cover', label: 'Cover' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-white">Class Schedule Data</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search table..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              {headers.map(({ key, label }) => (
                <th
                  key={key as string}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer group"
                  onClick={() => requestSort(key)}
                >
                  {label} {getSortIcon(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {paginatedData.length > 0 ? paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                {headers.map(({ key }) => (
                  <td key={key as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {key === 'status' ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Scheduled' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                      }`}>
                        {item.status}
                      </span>
                    ) : (
                      item[key] || <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length} className="text-center py-8 text-gray-400">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-700 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-700 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                    Next
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
