import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { staffApi, initiativesApi, allocationsApi, productsApi } from '../api/client';
import { MONTHLY_HOURS } from '@wip-it-good/shared';

interface Staff {
  id: string;
  name: string;
  location: string;
}

interface Initiative {
  id: string;
  name: string;
  productId: string;
  product: { name: string };
}

interface Allocation {
  staffId: string;
  initiativeId: string;
  month: number;
  year: number;
  percentage: number;
}

export default function AllocationsPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowStart, setWindowStart] = useState(new Date(2026, 0, 1)); // Jan 2026
  const [staffAllocations, setStaffAllocations] = useState<Record<string, string[]>>({}); // staffId -> initiativeIds[]
  const [gridWidth, setGridWidth] = useState(window.innerWidth - 100);
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth - 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, initiativesRes, allocationsRes, productsRes] = await Promise.all([
        staffApi.getAll(),
        initiativesApi.getAll(),
        allocationsApi.getAll(),
        productsApi.getAll(),
      ]);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
      setInitiatives(Array.isArray(initiativesRes.data) ? initiativesRes.data : []);
      setAllocations(Array.isArray(allocationsRes.data) ? allocationsRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      
      // Build initial staff allocations from existing data
      const staffAllocMap: Record<string, Set<string>> = {};
      (Array.isArray(allocationsRes.data) ? allocationsRes.data : []).forEach((alloc: any) => {
        if (!staffAllocMap[alloc.staffId]) {
          staffAllocMap[alloc.staffId] = new Set();
        }
        staffAllocMap[alloc.staffId].add(alloc.initiativeId);
      });
      
      const finalMap: Record<string, string[]> = {};
      Object.keys(staffAllocMap).forEach(staffId => {
        finalMap[staffId] = Array.from(staffAllocMap[staffId]);
      });
      setStaffAllocations(finalMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStaff([]);
      setInitiatives([]);
      setAllocations([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthsArray = () => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(windowStart);
      date.setMonth(date.getMonth() + i);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
    }
    return months;
  };

  const getAllocation = (staffId: string, initiativeId: string, month: number, year: number) => {
    const alloc = allocations.find(
      (a) => a.staffId === staffId && a.initiativeId === initiativeId && a.month === month && a.year === year
    );
    return alloc ? Number(alloc.percentage) : 0;
  };

  const calculateMonthlyHours = (percentage: number) => {
    return Math.round((percentage / 100) * MONTHLY_HOURS);
  };

  const saveAllocation = async (
    staffId: string,
    initiativeId: string,
    month: number,
    year: number,
    percentage: number
  ) => {
    try {
      await allocationsApi.create({
        staffId,
        initiativeId,
        month,
        year,
        percentage,
      });
      // Update local state
      setAllocations((prev) => {
        const filtered = prev.filter(
          (a) => !(a.staffId === staffId && a.initiativeId === initiativeId && a.month === month && a.year === year)
        );
        return [...filtered, { staffId, initiativeId, month, year, percentage }];
      });
    } catch (error) {
      console.error('Error saving allocation:', error);
    }
  };

  const handleAddRow = () => {
    // Not needed anymore - row is always there
  };

  const handleSaveNewRow = (staffId: string, initiativeId: string) => {
    if (!staffId || !initiativeId) return;
    
    setStaffAllocations(prev => {
      const existing = prev[staffId] || [];
      if (existing.includes(initiativeId)) {
        return prev; // Already assigned
      }
      return {
        ...prev,
        [staffId]: [...existing, initiativeId],
      };
    });
    
    // Grid will refresh and show a new empty row automatically
    if (gridRef.current) {
      gridRef.current.api.refreshCells();
    }
  };

  const handleCancelNewRow = () => {
    // Refresh grid to reset the new row
    if (gridRef.current) {
      gridRef.current.api.refreshCells();
    }
  };

  const handleRemoveInitiative = (staffId: string, initiativeId: string) => {
    setStaffAllocations(prev => ({
      ...prev,
      [staffId]: (prev[staffId] || []).filter(id => id !== initiativeId),
    }));
  };

  const months = getMonthsArray();

  // Create month columns - narrower to fit without scrolling
  const monthColumns = months.map((monthData) => ({
    headerName: monthData.label,
    field: `month_${monthData.month}_${monthData.year}`,
    width: 155,
    editable: true,
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: {
      min: 0,
      max: 100,
      precision: 0,
    },
    valueGetter: (params: any) => {
      if (!params.data || !params.data.initiativeId) return '';
      return getAllocation(params.data.staffId, params.data.initiativeId, monthData.month, monthData.year);
    },
    valueSetter: (params: any) => {
      if (!params.data || !params.data.initiativeId) return false;
      const value = Math.max(0, Math.min(100, Number(params.newValue) || 0));
      saveAllocation(params.data.staffId, params.data.initiativeId, monthData.month, monthData.year, value);
      return true;
    },
    cellStyle: (params: any) => {
      const value = params.value || 0;
      if (value === 0) return { backgroundColor: '#ffffff', textAlign: 'center' };
      if (value > 0 && value <= 25) return { backgroundColor: '#e3f2fd', textAlign: 'center' };
      if (value > 25 && value <= 50) return { backgroundColor: '#bbdefb', textAlign: 'center' };
      if (value > 50 && value <= 75) return { backgroundColor: '#90caf9', textAlign: 'center' };
      return { backgroundColor: '#64b5f6', color: '#fff', textAlign: 'center' };
    },
    tooltipValueGetter: (params: any) => {
      if (!params.data || !params.data.initiativeId) return '';
      const percentage = params.value || 0;
      const hours = calculateMonthlyHours(percentage);
      return `${percentage}% (~${hours} hours)`;
    },
  }));

  const columnDefs: any[] = [
    {
      headerName: 'Staff',
      field: 'staffName',
      pinned: 'left',
      width: 160,
      cellStyle: (params: any) => params.data?.isNewRow ? { fontStyle: 'italic', color: '#999' } : { fontWeight: 'bold' },
      editable: (params: any) => params.data?.isNewRow,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => ({
        values: ['', ...staff.map(s => s.name)],
      }),
      valueSetter: (params: any) => {
        if (params.data?.isNewRow) {
          const selectedStaff = staff.find(s => s.name === params.newValue);
          if (selectedStaff) {
            params.data.staffId = selectedStaff.id;
            params.data.staffName = selectedStaff.name;
          }
        }
        return true;
      },
      cellRenderer: (params: any) => {
        if (params.data?.isNewRow) {
          return '→ Add staff...';
        }
        return params.value;
      },
    },
    {
      headerName: 'Product',
      field: 'product',
      width: 180,
      cellStyle: (params: any) => params.data?.isNewRow ? { fontStyle: 'italic', color: '#999' } : {},
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => ({
        values: ['', ...products.map(p => p.name)],
      }),
      valueSetter: (params: any) => {
        const selectedProduct = products.find(p => p.name === params.newValue);
        if (selectedProduct) {
          params.data.productId = selectedProduct.id;
          params.data.product = selectedProduct.name;
          // Reset initiative when product changes
          if (!params.data?.isNewRow) {
            params.data.initiativeId = '';
            params.data.initiative = '';
          }
        }
        return true;
      },
    },
    {
      headerName: 'Initiative',
      field: 'initiative',
      width: 175,
      cellStyle: (params: any) => params.data?.isNewRow ? { fontStyle: 'italic', color: '#999' } : {},
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        const filteredInits = params.data?.productId
          ? initiatives.filter(i => i.productId === params.data.productId)
          : [];
        return {
          values: ['', ...filteredInits.map(i => i.name)],
        };
      },
      valueSetter: (params: any) => {
        const selectedInit = initiatives.find(i => i.name === params.newValue);
        if (selectedInit) {
          params.data.initiativeId = selectedInit.id;
          params.data.initiative = selectedInit.name;
          // Auto-save when initiative is selected on new row
          if (params.data?.isNewRow && params.data.staffId && params.data.initiativeId) {
            setTimeout(() => handleSaveNewRow(params.data.staffId, params.data.initiativeId), 100);
          }
        }
        return true;
      },
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        if (params.data.isNewRow) return '';
        return '✕';
      },
      onCellClicked: (params: any) => {
        if (params.data && !params.data.isNewRow) {
          handleRemoveInitiative(params.data.staffId, params.data.initiativeId);
        }
      },
    },
    ...monthColumns,
  ];

  // Build flat row data with staff + their assigned initiatives
  const rowData: any[] = [];
  
  staff.forEach((staffMember) => {
    const assignedInitiatives = staffAllocations[staffMember.id] || [];
    assignedInitiatives.forEach((initiativeId) => {
      const initiative = initiatives.find(i => i.id === initiativeId);
      if (initiative) {
        rowData.push({
          staffId: staffMember.id,
          staffName: staffMember.name,
          initiativeId: initiative.id,
          initiative: initiative.name,
          product: initiative.product?.name || 'Unknown',
        });
      }
    });
  });

  // Always add an empty row at the bottom
  rowData.push({
    isNewRow: true,
    staffId: '',
    staffName: '',
    productId: '',
    product: '',
    initiativeId: '',
    initiative: '',
  });

  const moveWindow = (direction: 'prev' | 'next') => {
    const newDate = new Date(windowStart);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setWindowStart(newDate);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Staff Allocations</h1>
      <p>Enter percentage allocations for each staff member per initiative per month</p>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        <button onClick={() => moveWindow('prev')}>← Previous Month</button>
        <button onClick={() => moveWindow('next')}>Next Month →</button>
        <span style={{ padding: '0.6em 1.2em' }}>
          Showing: {getMonthsArray()[0].label} - {getMonthsArray()[5].label}
        </span>
      </div>

      <div
        className="ag-theme-alpine"
        style={{ height: 600, width: `${gridWidth}px`, marginTop: '1rem' }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          singleClickEdit={true}
          tooltipShowDelay={500}
          suppressMovableColumns={true}
        />
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#333' }}>
        <h3 style={{ color: '#333' }}>Legend</h3>
        <p style={{ color: '#333' }}><strong>Cell colors:</strong> Lighter = lower allocation, Darker = higher allocation</p>
        <p style={{ color: '#333' }}><strong>Hover over cells</strong> to see approximate monthly hours (based on 2080 annual hours)</p>
        <p style={{ color: '#333' }}><strong>New assignments:</strong> Use the empty row at the bottom to add staff to initiatives</p>
      </div>
    </div>
  );
}
