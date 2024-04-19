import React from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateForm = ({
  dateValue = '',
  setDateValue,
  resetError,
  isDisableSubmit = false,
}) => {
  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  const handleSelectDate = (date) => {
    if (isDisableSubmit) return;
    setDateValue(date)
    resetError()
  }

  return (
    <div className="dateForm">
      <DatePicker
        selected={dateValue || ''}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        wrapperClassName="dateForm__input"
        onChangeRaw={handleDateChangeRaw}
        onChange={(date) => handleSelectDate(date)}
      />
      <div className="dateForm__icon"><img src="/icons/calendar.svg" alt="calendar" /></div>
    </div>
  )
}

export default DateForm
