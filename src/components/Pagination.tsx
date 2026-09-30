import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    // Show 5 pages on mobile, 9 on desktop
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxPagesToShow = isMobile ? 5 : 9;
    const pageNumbers = [];
    let startPage: number;
    let endPage: number;

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than or equal to max, show all page numbers
      startPage = 1;
      endPage = totalPages;
    } else {
      // 计算开始和结束页码
      const halfWay = Math.floor(maxPagesToShow / 2);
      
      if (currentPage <= halfWay) {
        // 当前页在前半部分
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + halfWay >= totalPages) {
        // 当前页在后半部分
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        // 当前页在中间
        startPage = currentPage - Math.floor(halfWay);
        endPage = currentPage + Math.floor(halfWay);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 whitespace-nowrap"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>
      
      <div className="flex items-center gap-1">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md min-w-[32px] sm:min-w-[36px] ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 whitespace-nowrap"
      >
        Next
      </button>
    </div>
  );
}