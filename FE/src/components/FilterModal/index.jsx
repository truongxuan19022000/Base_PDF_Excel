import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

import { useRoleSlice } from 'src/slices/role';
import { FILTER, INVENTORY } from 'src/constants/config';

const FilterModal = ({
  viewTab = '',
  submitting = false,
  searchText = '',
  messageError = '',
  onClickApply,
  filterRequest = [],
  onClickCancel,
  endDateFilter = '',
  startDateFilter = '',
  isDisableSubmit = false,
  marginTop = '',
  isDetail = false,
  isCustomer = false,
  isDocumentFilter = false,
  isHiddenSortOption = false,
  filterTitle = '',
  selectedRoleFilter = [],
  selectedFieldFilter = [],
  selectedProfileFilter = [],
  handleSelectProfileFilter,
  handleInputDateFilter,
  handleClickResetFilter,
  handleSelectRoleFilter,
  handleSelectFieldFilter,
}) => {
  const { actions } = useRoleSlice()

  const dispatch = useDispatch()
  const history = useHistory()

  const fetched = useSelector(state => state.role.fetched)
  const roleList = useSelector(state => state.role.list?.data)

  const currentURL = history.location.pathname;
  const baseURL = currentURL.split('/')[1];

  useEffect(() => {
    if (!fetched && baseURL === 'user-management') {
      dispatch(actions.getRoleList())
    }
  }, [fetched, baseURL])

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }
  const renderSelectOption = () => {
    return (
      filterRequest?.map((item, index) => {
        const isArray = Array.isArray(selectedFieldFilter);
        let isChecked = false
        if (isArray) {
          isChecked = selectedFieldFilter?.includes(item.filter);
        } else {
          isChecked = selectedFieldFilter === item.filter;
        }
        return (
          <div
            key={index}
            className="filterModal__name--option"
            onClick={() => handleSelectFieldFilter(item?.filter)}
          >
            <div className="filterModal__name--checkbox">
              <img
                src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
                alt={isChecked ? 'checked' : 'uncheck'}
              />
            </div>
            <span>{item?.text || ''}</span>
          </div>
        );
      })
    );
  }

  const renderFilterOption = () => {
    return (
      roleList?.map((item, index) => {
        const isChecked = selectedRoleFilter?.includes(item.id);
        return (
          <div
            key={index}
            className="filterModal__role--option"
            onClick={() => handleSelectRoleFilter(item?.id)}
          >
            <div className="filterModal__role--checkbox">
              <img
                src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
                alt={isChecked ? 'checked' : 'uncheck'}
              />
            </div>
            <span>{item?.role_name || ''}</span>
          </div>
        )
      })
    )
  }

  const renderProfiles = () => {
    return INVENTORY.PROFILES.map((item, index) => {
      const isChecked = selectedProfileFilter?.includes(item.value);
      return (
        item.value !== 0 &&
        <div
          key={index}
          className="filterModal__role--option"
          onClick={() => handleSelectProfileFilter(item.value)}
        >
          <div className="filterModal__role--checkbox">
            <img
              src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
              alt={isChecked ? 'checked' : 'uncheck'}
            />
          </div>
          <span>{item.label}</span>
        </div>
      );
    });
  };


  return (
    <div className={`filterModal${marginTop ? ` mt-${marginTop}` : ''}${isDetail ? ' filterModal--top' : ''}`}>
      <div className="filterModal__content" >
        <div className="filterModal__header">
          <div className="filterModal__header--title">Filters</div>
          <div className="filterModal__header--reset" onClick={handleClickResetFilter}>Reset</div>
        </div>
        <div className="filterModal__body">
          {(viewTab !== 'invoice' && !isHiddenSortOption) && (
            <div className="filterModal__name">
              <div className="filterModal__name--title">{filterTitle || ''}</div>
              <div className={`filterModal__name--box${isDocumentFilter ? ' filterModal__name--filterDocument' : ''}`}>
                {renderSelectOption()}
              </div>
            </div>
          )}
          {FILTER.HIDDEN_FILTER_OPTION_ROUTER.includes(baseURL) ? (
            <div className="filterModal__role">
              <div className="filterModal__role--title">
                {baseURL === 'inventory' ? 'SORT PROFILE BY' : 'FILTER ROLE BY'}
              </div>
              <div className="filterModal__role--box">
                {baseURL === 'inventory' ? (
                  <>
                    {renderProfiles()}
                  </>
                ) : (
                  <>
                    {renderFilterOption()}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="filterModal__date">
              {isDocumentFilter ? (
                <div className="filterModal__date--title">FILTER UPLOADED DATE</div>
              ) : (
                <div className="filterModal__date--title">FILTER {isCustomer ? 'CREATED' : 'ISSUED'} DATE</div>
              )}
              <div className="filterModal__date--box">
                <div className="filterModal__date--option">
                  <label className="filterModal__date--label">Select Start Date</label>
                  <div className={`filterModal__date--input${messageError?.start_date ? ' filterModal__date--inputError' : ''} `}>
                    <DatePicker
                      selected={startDateFilter || ''}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      onChangeRaw={handleDateChangeRaw}
                      onChange={(date) => handleInputDateFilter(date, FILTER.LABEL.START_DATE)}
                      disabled={submitting}
                    />
                    {messageError?.start_date && (
                      <div className="filterModal__message">{messageError?.start_date || ''}</div>
                    )}
                  </div>
                </div>
                <div className="filterModal__date--option">
                  <label className="filterModal__date--label">Select End Date</label>
                  <div className={`filterModal__date--input${messageError?.end_date ? ' filterModal__date--inputError' : ''} `}>
                    <DatePicker
                      selected={endDateFilter || ''}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      onChangeRaw={handleDateChangeRaw}
                      onChange={(date) => handleInputDateFilter(date, FILTER.LABEL.END_DATE)}
                      disabled={submitting}
                    />
                    {messageError?.end_date && (
                      <div className="filterModal__message">{messageError?.end_date || ''}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="d-flex w100">
          <button
            className="filterModal__button"
            onClick={onClickCancel}
            disabled={submitting || isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="filterModal__button filterModal__button--apply"
            onClick={() => onClickApply(searchText)}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
