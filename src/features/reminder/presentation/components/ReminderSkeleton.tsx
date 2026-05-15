import React from 'react';

/**
 * 실제 리마인더 UI 컴포넌트들의 스타일과 구조를 그대로 반영한 스켈레톤
 */
export function ReminderSkeleton() {
  return (
    <div className="gap-md flex flex-col animate-pulse">
      {[1, 2].map((sectionIndex) => (
        <section 
          key={sectionIndex} 
          className="p-lg mb-md box-border flex w-full min-w-[303px] flex-col rounded-lg bg-white shadow-sm dark:bg-[#151515]"
        >
          {/* Section Header Skeleton (SectionHeader.tsx 대응) */}
          <div className="flex items-center justify-between mb-4 h-[28px]">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-5 w-5 bg-gray-100 dark:bg-gray-900 rounded-sm"></div>
          </div>

          {/* Reminder Items Skeleton (ViewMode.tsx 대응) */}
          <div className="flex flex-col gap-3 mb-1">
            {[1, 2, 3].map((itemIndex) => (
              <div 
                key={itemIndex} 
                className="gap-sm -mx-2 -my-1 flex items-start p-2"
              >
                <div className="mt-[3px] h-[18px] w-[18px] shrink-0 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-[18px] w-3/4 bg-gray-100 dark:bg-gray-900 rounded"></div>
                  {itemIndex === 1 && (
                    <div className="h-[14px] w-1/4 bg-gray-50/50 dark:bg-gray-900/50 rounded"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section Footer Skeleton (SectionFooter.tsx 대응) */}
          <div className="mt-2 -mx-1 flex items-start px-1 py-1.5 gap-2">
            <div className="mt-[3.5px] h-4 w-4 shrink-0 rounded-sm border-[1.5px] border-dashed border-gray-200 dark:border-gray-800"></div>
            <div className="h-5 w-24 bg-gray-100/50 dark:bg-gray-900/50 rounded"></div>
          </div>
        </section>
      ))}
    </div>
  );
}
