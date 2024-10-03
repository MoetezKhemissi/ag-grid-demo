import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import PropTypes from "prop-types";

const TableComponent = ({ dates, initialValues, numItems = 3 }) => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const groupIndicesRef = useRef({}); 
  const gridRef = useRef(null); 
  const [sortingColumn, setSortingColumn] = useState(null);
  const dataRef = useRef([]);
  useEffect(() => {
    const initializeData = () => {
      const items = [];
      const indices = {};

      for (let i = 0; i < numItems; i++) {
        const itemNumber = i + 1;
        const itemGroup = `Item ${itemNumber}`;
        const groupIndex = i;

        indices[itemGroup] = i; 

       
        const outputRow = {
          Item: `Item ${itemNumber}`,
          ItemGroup: itemGroup,
          GroupIndex: groupIndex,
          Type: "Output",
          key: `Item${itemNumber}-Output`,
        };
        const shiftRow = {
          Item: "",
          ItemGroup: itemGroup,
          GroupIndex: groupIndex,
          Type: "Shift",
          key: `Item${itemNumber}-Shift`,
        };
        const overwriteRow = {
          Item: "",
          ItemGroup: itemGroup,
          GroupIndex: groupIndex,
          Type: "Overwrite",
          key: `Item${itemNumber}-Overwrite`,
        };
        const inputRow = {
          Item: "",
          ItemGroup: itemGroup,
          GroupIndex: groupIndex,
          Type: "Input",
          key: `Item${itemNumber}-Input`,
        };

       
        dates.forEach((date) => {
          outputRow[date] = initialValues[i] ? initialValues[i][date] || 0 : 0;
          inputRow[date] = initialValues[i] ? initialValues[i][date] || 0 : 0;
        });

        items.push(outputRow, shiftRow, overwriteRow, inputRow);
      }

      setRowData(items);
      dataRef.current = items;
      groupIndicesRef.current = indices; 
    };

    initializeData();
  }, [dates, initialValues, numItems]);

  useEffect(() => {
    const dynamicColumns = dates.map((date) => ({
      field: date,
      headerName: date,
      editable: (params) =>
        params.data.Type === "Shift" || params.data.Type === "Overwrite",
      sortable: true,
      comparator: (valueA, valueB, nodeA, nodeB) =>
        customGroupComparator(valueA, valueB, nodeA, nodeB, false, date),
    }));

    const fixedColumns = [
      { field: "ItemGroup", headerName: "Item Group", hide: true },
      { field: "GroupIndex", headerName: "Group Index", hide: true },
      {
        field: "Item",
        headerName: "Item",
        width: 120,
        sortable: true,
        comparator: (valueA, valueB, nodeA, nodeB) => {
          // Sort by ItemGroup to keep 4 related rows together
          const groupA = nodeA.data.ItemGroup;
          const groupB = nodeB.data.ItemGroup;
          return groupA.localeCompare(groupB);
        },
      },
      {
        field: "Type",
        headerName: "Type",
        width: 120,
        sortable: false, 
      },
      ...dynamicColumns,
    ];

    setColumnDefs(fixedColumns);
  }, [dates]);

  const customGroupComparator = (
    valueA,
    valueB,
    nodeA,
    nodeB,
    isDescending,
    sortingColumn
  ) => {
    const groupIndexA = groupIndicesRef.current[nodeA.data?.ItemGroup];
    const groupIndexB = groupIndicesRef.current[nodeB.data?.ItemGroup];

    const valueForGroupA = isDescending
      ? getMaxValueForGroup(nodeA.data?.ItemGroup, sortingColumn)
      : getMinValueForGroup(nodeA.data?.ItemGroup, sortingColumn);
    const valueForGroupB = isDescending
      ? getMaxValueForGroup(nodeB.data?.ItemGroup, sortingColumn)
      : getMinValueForGroup(nodeB.data?.ItemGroup, sortingColumn);

    if (valueForGroupA !== valueForGroupB) {
      return valueForGroupA - valueForGroupB;
    }

    return groupIndexA - groupIndexB;
  };
  const getMinValueForGroup = (group, date) => {
    if (!group || !date) {
      console.error("Group or date is undefined when calculating min value");
      return undefined;
    }

    const groupRows = dataRef.current.filter(
      (row) => row.ItemGroup === group && row.Type === "Output"
    ); 

    const values = groupRows
      .map((row) => {
        const value = parseFloat(row[date]);

        return value;
      })
      .filter((val) => !isNaN(val));

    const minValue = values.length > 0 ? Math.min(...values) : undefined;

    return minValue !== undefined ? minValue : Infinity;
  };

  const getMaxValueForGroup = (group, date) => {
    if (!group || !date) {
      console.error("Group or date is undefined when calculating max value");
      return undefined;
    }

    const groupRows = dataRef.current.filter(
      (row) => row.ItemGroup === group && row.Type === "Output"
    ); 

    const values = groupRows
      .map((row) => {
        const value = parseFloat(row[date]);

        return value;
      })
      .filter((val) => !isNaN(val));

    const maxValue = values.length > 0 ? Math.max(...values) : undefined;

    return maxValue !== undefined ? maxValue : -Infinity;
  };

  const onCellValueChanged = (params) => {
    const updatedRows = [...rowData];
    const groupKey = params.data?.ItemGroup;
    if (!groupKey) return;

    const groupRows = updatedRows.filter((row) => row.ItemGroup === groupKey);
    const outputRow = groupRows.find((row) => row.Type === "Output");
    const shiftRow = groupRows.find((row) => row.Type === "Shift");
    const overwriteRow = groupRows.find((row) => row.Type === "Overwrite");
    const inputRow = groupRows.find((row) => row.Type === "Input");

    if (!outputRow || !shiftRow || !overwriteRow || !inputRow) return;

    dates.forEach((date) => {
      const overwriteValue = parseFloat(overwriteRow[date]) || 0;
      const shiftValue = parseFloat(shiftRow[date]) || 0;
      const inputValue = parseFloat(inputRow[date]) || 0;

      outputRow[date] =
        !isNaN(overwriteValue) && overwriteValue !== 0
          ? overwriteValue
          : inputValue + shiftValue;
    });
    dataRef.current = updatedRows;
    setRowData(updatedRows);
  };

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: 600, width: "100%", marginTop: "20px" }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
        onSortChanged={(event) => {
          const sortedColumns = event.columns || [];
          if (sortedColumns.length > 0) {
            setSortingColumn(sortedColumns[0].getColId());
          } else {
            setSortingColumn(null);
          }
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
