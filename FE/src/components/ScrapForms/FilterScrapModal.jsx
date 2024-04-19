import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FilterScrapModal = ({
  checkList = [],
  messageError = {},
  selectedStatus = [],
  isDetail = false,
  isShowDate = true,
  isShowName = true,
  isShowStatus = true,
  isShowLength = true,
  isDisableSubmit = false,
  className = '',
  minLength = '',
  maxLength = '',
  endDateFilter = '',
  startDateFilter = '',
  onClickApply,
  onClickCancel,
  handleInputValue,
  handleCheckBoxChange,
  handleClickResetFilter,
}) => {

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  const renderStatusOption = () => {
    return (
      checkList.map((item, index) => {
        const isChecked = !!selectedStatus?.includes(item.value);
        return (
          item.value !== 0 &&
          <div
            key={index}
            className="scrapModalBox__option scrapModalBox__option--checkbox"
            onClick={() => handleCheckBoxChange(item.value)}
          >
            <div className="scrapModalBox__checkbox">
              <img
                src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
                alt={isChecked ? 'checked' : 'uncheck'}
              />
            </div>
            <span>{item.label}</span>
          </div>
        );
      })
    );
  }

  const renderNameOption = () => {
    return (
      checkList.map((item, index) => {
        const isChecked = !!selectedStatus?.includes(item.filter);
        return (
          item.value !== 0 &&
          <div
            key={index}
            className="scrapModalBox__option scrapModalBox__option--checkbox"
            onClick={() => handleCheckBoxChange(item.filter)}
          >
            <div className="scrapModalBox__checkbox">
              <img
                src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
                alt={isChecked ? 'checked' : 'uncheck'}
              />
            </div>
            <span>{item.text}</span>
          </div>
        );
      })
    );
  }

  return (
    <div className={`filterScrapModal${className && ` filterScrapModal--${className}`}${isDetail ? ' filterScrapModal--detail' : ''}`}>
      <div className="filterScrapModal__content" >
        <div className="filterScrapModal__header">
          <div className="filterScrapModal__headLine">Filters</div>
          <div className="filterScrapModal__resetBtn" onClick={handleClickResetFilter}>Reset</div>
        </div>
        <div className="filterScrapModal__body">
          {isShowName &&
            <div className="scrapModalBox">
              <div className="scrapModalBox__title">SORT BY NAME</div>
              <div className="scrapModalBox__box scrapModalBox__box--selection">
                {renderNameOption()}
              </div>
            </div>
          }
          {isShowStatus &&
            <div className="scrapModalBox">
              <div className="scrapModalBox__title">SORT BY STATUS</div>
              <div className="scrapModalBox__box scrapModalBox__box--selection">
                {renderStatusOption()}
              </div>
            </div>
          }
          {isShowLength &&
            <div className="scrapModalBox">
              <div className="scrapModalBox__title">SORT BY LENGTH</div>
              <div className="scrapModalBox__box">
                <div className="scrapModalBox__option">
                  <label className="scrapModalBox__label">Min Length</label>
                  <div className={`scrapModalBox__inputBox scrapModalBox__inputBox--unit${messageError?.min_length ? ' scrapModalBox__inputBox--error' : ''} `}>
                    <input
                      type="number"
                      className="scrapModalBox__input"
                      placeholder="0.00"
                      value={minLength || ''}
                      onChange={(e) => handleInputValue('min_length', e.target.value)}
                    />
                    <div className="scrapModalBox__unit">m</div>
                  </div>
                  {messageError?.min_length && (
                    <div className="scrapModalBox__message">{messageError.min_length || ''}</div>
                  )}
                </div>
                <div className="scrapModalBox__option">
                  <label className="scrapModalBox__label">Max Length</label>
                  <div className={`scrapModalBox__inputBox scrapModalBox__inputBox--unit${messageError?.max_length ? ' scrapModalBox__inputBox--error' : ''} `}>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="scrapModalBox__input"
                      value={maxLength || ''}
                      onChange={(e) => handleInputValue('max_length', e.target.value)}
                    />
                    <div className="scrapModalBox__unit">m</div>
                  </div>
                  {messageError?.max_length && (
                    <div className="scrapModalBox__message">{messageError.max_length || ''}</div>
                  )}
                </div>
              </div>
            </div>
          }
          {isShowDate &&
            <div className="scrapModalBox">
              <div className="scrapModalBox__title">FILTER CREATED DATE</div>
              <div className="scrapModalBox__box">
                <div className="scrapModalBox__option">
                  <label className="scrapModalBox__label">Select Start Date</label>
                  <div className={`scrapModalBox__inputBox${messageError?.start_date ? ' scrapModalBox__input--error' : ''} `}>
                    <DatePicker
                      selected={startDateFilter || ''}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      onChangeRaw={handleDateChangeRaw}
                      onChange={(date) => handleInputValue('start_date', date)}
                    />
                    {messageError?.start_date && (
                      <div className="scrapModalBox__message">{messageError.start_date || ''}</div>
                    )}
                  </div>
                </div>
                <div className="scrapModalBox__option">
                  <label className="scrapModalBox__label">Select End Date</label>
                  <div className={`scrapModalBox__inputBox${messageError?.end_date ? ' scrapModalBox__input--error' : ''} `}>
                    <DatePicker
                      selected={endDateFilter || ''}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      onChangeRaw={handleDateChangeRaw}
                      onChange={(date) => handleInputValue('end_date', date)}
                    />
                    {messageError?.end_date && (
                      <div className="scrapModalBox__message">{messageError.end_date || ''}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          }
          {messageError?.message &&
            <div className="filterScrapModal__message">{messageError.message}</div>
          }
        </div>
        <div className="d-flex w100">
          <button
            className="filterScrapModal__button"
            onClick={onClickCancel}
          >
            Cancel
          </button>
          <button
            className="filterScrapModal__button filterScrapModal__button--apply"
            onClick={onClickApply}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterScrapModal;
