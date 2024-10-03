import React from 'react';
import TableComponent from './components/tableComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import { dates, initialValues } from './components/data';

const App = () => {
  return (
    <div>
      <h2>Data Table</h2>
      <TableComponent dates={dates} initialValues={initialValues} />
    </div>
  );
};

export default App;
