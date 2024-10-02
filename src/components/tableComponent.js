import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import PropTypes from 'prop-types';

const TableComponent = ({ dates, initialValues, numItems = 3 }) => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  // Initialize the table data and columns based on dates and initialValues
  useEffect(() => {
    // Dynamically create column definitions based on dates
    const dynamicColumns = dates.map((date) => ({
      field: date,
      headerName: date,
      editable: false,
      valueParser: (params) => parseFloat(params.newValue) || '',
      // Optionally, you can set width or other properties here
    }));

    // Add fixed columns: Item and Type
    const fixedColumns = [
      { field: 'Item', headerName: 'Item', width: 120 },
      { field: 'Type', headerName: 'Type', width: 120 },
      ...dynamicColumns,
    ];

    // Define which columns are editable (Shift and Overwrite)
    fixedColumns.forEach((col) => {
      if (dates.includes(col.field)) {
        col.editable = true;
      }
    });

    setColumnDefs(fixedColumns);

    // Initialize row data based on numItems and dates
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const itemNumber = i + 1;
      // Output Row
      const outputRow = {
        Item: `Item ${itemNumber}`,
        Type: 'Output',
      };
      // Shift Row
      const shiftRow = {
        Item: '',
        Type: 'Shift',
      };
      // Overwrite Row
      const overwriteRow = {
        Item: '',
        Type: 'Overwrite',
      };
      // Input Row
      const inputRow = {
        Item: '',
        Type: 'Input',
      };

      // Populate Output and Input with initialValues
      dates.forEach((date) => {
        outputRow[date] = initialValues[i] ? initialValues[i][date] || 0 : 0;
        inputRow[date] = initialValues[i] ? initialValues[i][date] || 0 : 0;
      });

      items.push(outputRow, shiftRow, overwriteRow, inputRow);
    }

    setRowData(items);
  }, [dates, initialValues, numItems]);

  // Handle cell value changes to recalculate Output
  const onCellValueChanged = (params) => {
    const updatedRows = [...rowData];
    const rowIndex = params.node.rowIndex;
    const field = params.colDef.field;

    // Determine the group index (each item has 4 rows)
    const groupIndex = Math.floor(rowIndex / 4) * 4;

    const outputRow = updatedRows[groupIndex];
    const shiftRow = updatedRows[groupIndex + 1];
    const overwriteRow = updatedRows[groupIndex + 2];
    const inputRow = updatedRows[groupIndex + 3];

    // Recalculate Output for all dates
    dates.forEach((date) => {
      const overwriteValue = parseFloat(overwriteRow[date]);
      const shiftValue = parseFloat(shiftRow[date]) || 0;
      const inputValue = parseFloat(inputRow[date]) || 0;

      if (!isNaN(overwriteValue)) {
        outputRow[date] = overwriteValue;
      } else {
        outputRow[date] = inputValue + shiftValue;
      }
    });

    setRowData(updatedRows);
  };

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: 600, width: '100%', marginTop: '20px' }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        defaultColDef={{
          flex: 1,
          minWidth: 100,
          resizable: true,
        }}
        suppressRowClickSelection={true}
        rowSelection="multiple"
      />
    </div>
  );
};

TableComponent.propTypes = {
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.object).isRequired,
  numItems: PropTypes.number,
};

export default TableComponent;
