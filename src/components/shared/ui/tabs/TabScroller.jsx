import React, { useRef, useState, useEffect } from 'react';
import Tab from './Tab.jsx';

const TabScroller = ({ tabsConfig, activeTabId, visitedTabs, tabStatus, onTabSelect }) => {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [tabsConfig]);

  useEffect(() => {
    if (containerRef.current) {
      const currentIdx = tabsConfig.findIndex((t) => t.id === activeTabId);
      const activeTabElement = containerRef.current.children[currentIdx];
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
      setTimeout(checkScrollButtons, 300);
    }
  }, [activeTabId, tabsConfig]);

  const scroll = (direction) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300); // Re-check after animation completes
    }
  };

  return (
    <div className="flex items-stretch w-full bg-slate-50 border-b border-slate-200 px-1">
      <button 
        type="button" 
        onClick={() => scroll(-1)} 
        disabled={!canScrollLeft}
        className={`flex items-center justify-center px-3 font-bold text-xl transition-colors select-none ${
          !canScrollLeft ? "text-slate-300 cursor-default" : "text-slate-500 hover:text-indigo-600 cursor-pointer"
        }`}
        aria-label="Scroll left"
      >
        &#8249;
      </button>
      
      <div 
        ref={containerRef} 
        onScroll={checkScrollButtons}
        className="flex-1 flex items-end gap-2 overflow-x-auto scroll-smooth scrollbar-none whitespace-nowrap pt-3"
      >
        {tabsConfig.map((tab) => { 
          const derivedStatus = activeTabId === tab.id 
            ? 'ACTIVE' 
            : (visitedTabs[tab.id] ? tabStatus[tab.id] : 'PRISTINE');
            
          return (
            <Tab 
              key={tab.id} 
              name={tab.label} 
              isActive={activeTabId === tab.id} 
              status={derivedStatus} 
              onSelect={() => onTabSelect(tab.id)}
            />
          );
        })}
      </div>
      
      <button 
        type="button" 
        onClick={() => scroll(1)} 
        disabled={!canScrollRight}
        className={`flex items-center justify-center px-3 font-bold text-xl transition-colors select-none ${
          !canScrollRight ? "text-slate-300 cursor-default" : "text-slate-500 hover:text-indigo-600 cursor-pointer"
        }`}
        aria-label="Scroll right"
      >
        &#8250;
      </button>
    </div>
  );
};

export default TabScroller;