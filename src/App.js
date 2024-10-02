import React, { useState } from 'react';
import TableComponent from './components/tableComponent'
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [dates, setDates] = useState(['']);
  const [initialValues, setInitialValues] = useState([]);
  const [numItems] = useState(3); 
  const [step, setStep] = useState(1); 
  const handleAddDate = () => {
    setDates([...dates, '']);
  };

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Proceed to the next step
    setStep(2);
  };

  const handleInitialValueChange = (itemIndex, dateIndex, value) => {
    const newValues = [...initialValues];
    if (!newValues[itemIndex]) {
      newValues[itemIndex] = {};
    }
    newValues[itemIndex][dates[dateIndex]] = parseFloat(value) || 0;
    setInitialValues(newValues);
  };

  const handleSubmitValues = (e) => {
    e.preventDefault();
    // Proceed to show the table
    setStep(3);
  };

  if (step === 3) {
    // Filter out empty dates
    const filteredDates = dates.filter((date) => date.trim() !== '');
    return (
      <div>
        <h2>Data Table</h2>
        <TableComponent dates={filteredDates} initialValues={initialValues} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Enter Input Values for Each Item</h2>
        <form onSubmit={handleSubmitValues}>
          {[...Array(numItems)].map((_, itemIndex) => (
            <div key={itemIndex}>
              <h4>Item {itemIndex + 1}</h4>
              {dates.map((date, dateIndex) => (
                <div key={dateIndex}>
                  <label>{dates[dateIndex] || `Date ${dateIndex + 1}`}: </label>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleInitialValueChange(itemIndex, dateIndex, e.target.value)
                    }
                    placeholder={`Value for ${dates[dateIndex] || `Date ${dateIndex + 1}`}`}
                  />
                </div>
              ))}
            </div>
          ))}
          <button type="submit">Submit Values</button>
        </form>
      </div>
    );
  }

  // Step 1: Enter Dates
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome</h1>
      <p>Please input any number of dates you would like.</p>
      <form onSubmit={handleNextStep}>
        <div>
          <h3>Enter Dates</h3>
          {dates.map((date, index) => (
            <input
              key={index}
              type="text"
              value={date}
              onChange={(e) => handleDateChange(index, e.target.value)}
              placeholder="Enter date (e.g., Jan-24)"
            />
          ))}
          <div>
            <button type="button" onClick={handleAddDate}>
              Add Another Date
            </button>
          </div>
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default App;
