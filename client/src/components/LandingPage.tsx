import React, { useState, useEffect } from "react";
import axios from "axios";
import ResizeObserver from "resize-observer-polyfill";
import ReceiptCard from "./ReceiptCard";
import ReceiptEditor from "./ReceiptEditor";
import './LandingPage.css';
import { FaSun, FaMoon } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Service {
  description: string;
  amount: number;
}

interface Receipt {
  id: string;
  date: string;
  servicePeriod: string;
  services: Service[];
  taxRate: number;
  amountWithoutTax: number;
  amountWithTax: number;
  customerName: string;
  customerAddress: string;
  district: string;
  city: string;
}

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const LandingPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleYears, setVisibleYears] = useState<{ [key: string]: boolean }>({});
  const [visibleMonths, setVisibleMonths] = useState<{ [key: string]: { [key: number]: boolean } }>({});
  const [isDarkMode, setIsDarkMode] = useState(Cookies.get('darkMode') === 'true'); // Initialize from cookie
  const [isSelectPagesVisible, setIsSelectPagesVisible] = useState(true);
  const [isExportVisible, setIsExportVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false); // Add state for selection mode
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]); // Add state for selected receipts

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    const monthSections = document.querySelectorAll('.month-section');
    monthSections.forEach(section => {
      const year = section.getAttribute('data-year');
      const month = section.getAttribute('data-month');
      if (year && month) {
        adjustMonthLineHeight(year, parseInt(month));
      }
    });

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const year = entry.target.getAttribute('data-year');
        const month = entry.target.getAttribute('data-month');
        if (year && month) {
          adjustMonthLineHeight(year, parseInt(month));
        }
      });
    });

    monthSections.forEach(section => {
      resizeObserver.observe(section);
    });

    return () => {
      monthSections.forEach(section => {
        resizeObserver.unobserve(section);
      });
    };
  }, [receipts, years]);

  useEffect(() => {
    const initialVisibleMonths = years.reduce((acc, year) => {
      acc[year] = months.reduce((monthAcc, _, index) => {
        monthAcc[index] = true;
        return monthAcc;
      }, {} as { [key: number]: boolean });
      return acc;
    }, {} as { [key: string]: { [key: number]: boolean } });

    setVisibleMonths(initialVisibleMonths);
  }, [years]);

  useEffect(() => {
    const initialVisibleYears = years.reduce((acc, year) => {
      acc[year] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    setVisibleYears(initialVisibleYears);
  }, [years]);

  useEffect(() => {
    years.forEach(year => {
      adjustAllMonthLineHeights(year);
    });
  }, [years]);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/receipts`);
      const validReceipts = response.data.filter((receipt: Receipt) => receipt.date);
      setReceipts(validReceipts);

      const uniqueYears: string[] = Array.from(new Set(validReceipts.map((receipt: Receipt) => receipt.date.split("-")[0])));
      uniqueYears.sort((a, b) => parseInt(b) - parseInt(a)); // Sort years in descending order

      // Filter out years with no receipts in any month
      const filteredYears = uniqueYears.filter(year => {
        return validReceipts.some((receipt: Receipt) => receipt.date.startsWith(year));
      });

      setYears(filteredYears);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  const handleUpdate = (updatedReceipt: Receipt) => {
    setReceipts((prevReceipts) =>
      prevReceipts.map((receipt) =>
        receipt.id === updatedReceipt.id ? updatedReceipt : receipt
      )
    );
  };

  const handleDelete = (receiptId: string) => {
    setReceipts((prevReceipts) =>
      prevReceipts.filter((receipt) => receipt.id !== receiptId)
    );
    setIsEditorOpen(false);
  };

  const groupedReceiptsByYear = years.reduce((acc, year) => {
    acc[year] = receipts.filter(receipt => receipt.date && receipt.date.startsWith(year)).reduce((acc, receipt) => {
      const month = new Date(receipt.date).getMonth();
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(receipt);
      return acc;
    }, {} as { [key: number]: Receipt[] });
    return acc;
  }, {} as { [key: string]: { [key: number]: Receipt[] } });

  const handleAddReceipt = async (newReceipt: Receipt) => {
    
    setIsEditorOpen(false);

  };

  const handleCancel = () => {
    setIsEditorOpen(false);
    setIsSelectPagesVisible(true);
    setIsExportVisible(false);
    setIsSelectionMode(false); // Exit selection mode on cancel
    setSelectedReceipts([]); // Clear selected receipts on cancel
    fetchReceipts(); // Reload receipts after closing the editor
  };

  const handleOpenEditor = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsEditorOpen(true);
      setIsAnimating(false);
    }, 500); // Duration of the animation
  };

  const handleSelectPages = () => {
    setIsSelectPagesVisible(false);
    setIsExportVisible(true);
    setIsSelectionMode(true); // Enter selection mode
  };

  const handleExport = async () => {
    const doc = new jsPDF();
    const selectedReceiptElements = selectedReceipts.map(id => document.getElementById(`receipt-${id}`));

    for (let i = 0; i < selectedReceiptElements.length; i++) {
      const element = selectedReceiptElements[i];
      if (element) {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) {
          doc.addPage();
        }
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
    }

    doc.save('receipts.pdf');
  };

  const updateMonthLines = () => {
    const monthSections = document.querySelectorAll('.month-section');
    monthSections.forEach(section => {
      const line = section.querySelector('.month-line') as HTMLElement;
      if (line) {
        line.style.height = `${section.clientHeight - 30}px`;
      }
    });
  };

  const toggleYearVisibility = (year: string) => {
    setVisibleYears(prev => {
      const newVisibleYears = { ...prev, [year]: !prev[year] };
      setTimeout(() => {
        updateMonthLines();
        adjustAllMonthLineHeights(year); // Recalculate the height of all month-lines in the year
      }, 0); // Update lines after state change
      return newVisibleYears;
    });
  };

  const toggleMonthVisibility = (year: string, month: number) => {
    setVisibleMonths(prev => {
      const newVisibleMonths = {
        ...prev,
        [year]: {
          ...prev[year],
          [month]: !prev[year]?.[month]
        }
      };

      const monthSection = document.querySelector(`.month-section[data-year="${year}"][data-month="${month}"]`);
      const receiptsContainer = monthSection?.querySelector('.receipts-container');

      if (receiptsContainer) {
        if (newVisibleMonths[year][month]) {
          receiptsContainer.classList.remove('collapsing');
          receiptsContainer.classList.add('expanding');
        } else {
          receiptsContainer.classList.remove('expanding');
          receiptsContainer.classList.add('collapsing');
        }
      }

      setTimeout(() => {
        updateMonthLines();
        adjustMonthLineHeight(year, month);
      }, 0); // Update lines after state change

      return newVisibleMonths;
    });
  };

  const adjustMonthLineHeight = (year: string, month: number) => {
    const monthSection = document.querySelector(`.month-section[data-year="${year}"][data-month="${month}"]`);
    if (monthSection) {
      const monthLabel = monthSection.querySelector('.month-label') as HTMLElement;
      if (monthLabel) {
        monthLabel.style.setProperty('--line-height', `${monthSection.clientHeight - 30}px`);
      }
    }
  };

  const adjustAllMonthLineHeights = (year: string) => {
    months.forEach((_, month) => {
      adjustMonthLineHeight(year, month);
    });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    Cookies.set('darkMode', newDarkMode.toString(), { expires: 365 }); // Store preference in cookie
  };

  const totalReceiptsByYear = years.reduce((acc, year) => {
    acc[year] = months.reduce((monthAcc, _, index) => {
      monthAcc += groupedReceiptsByYear[year]?.[index]?.length || 0;
      return monthAcc;
    }, 0);
    return acc;
  }, {} as { [key: string]: number });

  const totalReceiptsByMonth = years.reduce((acc, year) => {
    acc[year] = months.map((_, index) => groupedReceiptsByYear[year]?.[index]?.length || 0);
    return acc;
  }, {} as { [key: string]: number[] });

  const handleReceiptSelect = (receiptId: string) => {
    setSelectedReceipts(prev => {
      if (prev.includes(receiptId)) {
        return prev.filter(id => id !== receiptId);
      } else {
        return [...prev, receiptId];
      }
    });
  };

  return (
    <div className={`landing-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1>Receipt Overview</h1>
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <FaSun /> : <FaMoon />}
      </button>
      <div className="timeline-container">
        {years.map(year => (
          <div key={year} className="year-section">
            <div className="year-label" onClick={() => toggleYearVisibility(year)}>
              {year} {!visibleYears[year] && (
                <div className="year-roll">
                  <div className="receipt-roll">
                    <span>{totalReceiptsByYear[year]} Receipts</span>
                  </div>
                </div>
              )}
            </div>
            {visibleYears[year] && (
              <div className="months-container">
                {months.map((month, index) => (
                  <div key={index} className="month-section" data-year={year} data-month={index}>
                    <div className={`month-label ${groupedReceiptsByYear[year] && groupedReceiptsByYear[year][index] && groupedReceiptsByYear[year][index].length > 0 ? 'has-receipts' : 'no-receipts'} ${visibleMonths[year]?.[index] ? 'visible' : ''}`} onClick={() => toggleMonthVisibility(year, index)}>
                      {month}
                    </div>
                    {visibleMonths[year]?.[index] ? (
                      <div className="receipts-container expanded">
                        {groupedReceiptsByYear[year] && groupedReceiptsByYear[year][index] && groupedReceiptsByYear[year][index].map(receipt => (
                          <ReceiptCard
                            key={receipt.id}
                            receipt={receipt}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            fetchReceipts={fetchReceipts}
                            className={isDarkMode ? 'dark-mode' : ''}
                            isSelectionMode={isSelectionMode} // Pass selection mode state
                            isSelected={selectedReceipts.includes(receipt.id)} // Pass selected state
                            onSelect={handleReceiptSelect} // Pass select handler
                          />
                        ))}
                      </div>
                    ) : (
                      groupedReceiptsByYear[year] && groupedReceiptsByYear[year][index] && groupedReceiptsByYear[year][index].length > 0 && (
                        <div className="receipt-roll" onClick={() => toggleMonthVisibility(year, index)}>
                          <span>{groupedReceiptsByYear[year][index].length} Receipts</span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="button-container">
        <button className={`add-receipt-button ${isAnimating ? 'animating' : ''}`} onClick={handleOpenEditor} style={{ marginBottom: '80px' }}>Add New Receipt</button>
        {isSelectPagesVisible && (
          <button className={`add-receipt-button ${isAnimating ? 'animating' : ''}`} onClick={handleSelectPages}>Select Pages</button>
        )}
        {isExportVisible && (
          <>
            <button className={`add-receipt-button ${isAnimating ? 'animating' : ''}`} onClick={handleCancel} style={{ marginRight: '120px' }}>Cancel</button>
            <button className={`add-receipt-button ${isAnimating ? 'animating' : ''}`} onClick={handleExport}>Export</button>
          </>
        )}
      </div>
      {isEditorOpen && (
        <>
          <div className="overlay visible"></div>
          <div className="receipt-editor-container visible">
            <ReceiptEditor
              receipt={{ id: "0", date: "", servicePeriod: "", services: [], taxRate: 20, amountWithoutTax: 0, amountWithTax: 0, customerName: "", customerAddress: "", district: "", city: "" }}
              onSave={handleAddReceipt}
              onCancel={handleCancel}
              onDelete={handleDelete}
              fetchReceipts={fetchReceipts} // Pass fetchReceipts as a prop
              className={isDarkMode ? 'dark-mode' : ''} />
          </div>
        </>
      )}
    </div>
  );
};

export default LandingPage;