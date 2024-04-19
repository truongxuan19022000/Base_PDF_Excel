import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Loading from 'src/components/Loading';
import PhoneCodeForm from 'src/components/PhoneCodeForm';
import ActivityLogsForm from 'src/components/ActivityLogsForm';
import SelectQuotationForm from 'src/components/SelectQuotationForm';
import PriceInputForm from 'src/components/InputForm/PriceInputForm';

import { ACTIVITY, COUNTRY_CODE, PERMISSION } from 'src/constants/config';
import { formatPhoneNumber, formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber } from 'src/helper/helper';
import { validatePermission } from 'src/helper/validation';
import { useClaimsSlice } from 'src/slices/claims';

const DetailForm = ({
  data = {},
  setClaimNo,
  setSearchText,
  setMessageError,
  handleSelectDate,
  handleDateChangeRaw,
  handleSelectedReference,
  setLessPaymentReceived,
}) => {
  const dispatch = useDispatch();
  const { actions } = useClaimsSlice();

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  useEffect(() => {
    return () => {
      dispatch(actions.clearSelectedCopyClaim())
      dispatch(actions.clearClaimCopiedDetailInfo())
    }
  }, [])

  const handleInputChange = (field, value) => {
    if (isDisableSubmit) return
    const fieldSetters = {
      claim_no: setClaimNo,
      search_text: setSearchText,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setMessageError({})
    }
  }

  const handleAmountChange = (value) => {
    setLessPaymentReceived(value);
    setMessageError({})
  };

  const handleClickOutAmount = (e) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formatted = formatPriceWithTwoDecimals(value)

    setLessPaymentReceived(formatted);
  };

  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const addressObject = typeof data.quotationInfo?.address === 'string'
    ? JSON.parse(data.quotationInfo.address) : data.quotationInfo?.address;

  const [phoneCode, formattedPhoneNumber] = useMemo(() => {
    if (!data.quotationInfo?.phone_number) return ['', ''];
    const formattedNumber = formatPhoneNumber(data.quotationInfo?.phone_number.toString()?.slice(3));
    const code = data.quotationInfo?.phone_number.toString().slice(0, 3);
    return [code, formattedNumber];
  }, [data.quotationInfo?.phone_number]);

  return (
    <div className="claimDetailContent">
      <div className={`createClaim__content${data.isEditMode ? ' createClaim__content--edit' : ''}`}>
        <div className="createClaim__contentInner">
          <div className={`createClaim__section${isEditAllowed ? '' : ' createClaim__section--disabled'}`}>
            <div className="createClaim__formData">
              <label>Claim No.</label>
              <input
                type="text"
                className={`createClaim__input${data.messageError?.claim_no ? ' createClaim__input--error' : ''}`}
                onChange={(e) => handleInputChange('claim_no', e.target.value)}
                name="claim_no"
                placeholder="Claim No."
                value={data.claimNo || ''}
                autoFocus={!data.isEditMode}
                disabled={data.isCopied}
              />
              {data.messageError?.claim_no &&
                <p className="createClaim__error">
                  {data.messageError.claim_no || ''}
                </p>
              }
            </div>
            <div className="createClaim__formData">
              <label>Previous Claim No.</label>
              <div className={`createClaim__input createClaim__input--disabled${data.previousClaimNo ? ' createClaim__input--previous' : ''}${data.messageError?.previous_claim_no ? ' createClaim__input--error' : ''}`}>
                {data.previousClaimNo ? data.previousClaimNo : 'Previous Claim No.'}
              </div>
              {data.messageError?.previous_claim_no &&
                <p className="createClaim__error">
                  {data.messageError.previous_claim_no}
                </p>
              }
            </div>
          </div>
          <div className={`createClaim__section${isEditAllowed ? '' : ' createClaim__section--disabled'}`}>
            <div className="createClaim__formData">
              <label>Reference No.</label>
              {data.referenceNo ?
                <div className={`createClaim__input createClaim__input--disabled createClaim__input--previous${data.messageError?.reference_no ? ' createClaim__input--error' : ''}`}>
                  {data.referenceNo || 'Reference No.'}
                </div>
                : <SelectQuotationForm
                  validSelectProperty="id"
                  keyValue="reference_no"
                  displayName="reference_no"
                  placeholder="Reference No."
                  searchText={data.searchText}
                  messageError={data.messageError}
                  selectedQuotation={data.selectedQuotation}
                  searchResults={data.searchReferenceResult}
                  isSearching={data.isSearching}
                  setSearchText={setSearchText}
                  handleInputChange={(e) => handleInputChange('search_text', e.target.value)}
                  setSelectedQuotation={handleSelectedReference}
                  setIsDisableSubmit={setIsDisableSubmit}
                />
              }
              {data.messageError?.reference_no &&
                <p className="createClaim__error">
                  {data.messageError.reference_no}
                </p>
              }
            </div>
            <div className="createClaim__formData">
              <label>Issue Date</label>
              <DatePicker
                disabled={data.isCopied}
                selected={data.issueDate || ''}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                onChangeRaw={handleDateChangeRaw}
                onChange={(date) => handleSelectDate('issue_date', date)}
                className={`createClaim__input${data.messageError?.issue_date ? ' createClaim__input--error' : ''}`}
              />
              <img
                className="createClaim__formData--icon"
                src="/icons/calendar.svg"
                alt="calendar"
              />
              {data.messageError?.issue_date &&
                <p className="createClaim__error">
                  {data.messageError.issue_date}
                </p>
              }
            </div>
          </div>
          {data.isSearching ?
            <Loading /> :
            !isEmptyObject(data.quotationInfo) &&
            <>
              <div className="createClaim__section">
                <div className="createClaim__formData">
                  <label>Name</label>
                  <input
                    type="text"
                    className="createClaim__input"
                    placeholder="Name"
                    name="name"
                    value={data.quotationInfo?.name || ''}
                    disabled
                  />
                </div>
                <div className="createClaim__formData">
                  <label>Company Name (optional)</label>
                  <input
                    type="text"
                    className="createClaim__input"
                    placeholder="Company Name (optional)"
                    value={data.quotationInfo?.company_name || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="createClaim__section">
                <div className="createClaim__formData">
                  <label>Phone</label>
                  <div className="box__phone createClaim__disabled">
                    <div className="box__phoneCode">
                      <PhoneCodeForm
                        phoneList={COUNTRY_CODE}
                        selectedItem={phoneCode || COUNTRY_CODE[1]}
                        isDisable
                        setIsShow={() => { }}
                      />
                    </div>
                    <div className="box__divider"></div>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={formattedPhoneNumber || ''}
                      className="box__phoneNumber"
                      disabled
                    />
                  </div>
                </div>
                <div className="createClaim__formData">
                  <label>Email</label>
                  <input
                    type="text"
                    className="createClaim__input"
                    placeholder="Email"
                    value={data.quotationInfo?.email || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="createClaim__section">
                <div className="box">
                  <div className="box__left box__left--address">
                    <div className="box__title">Address</div>
                    <input
                      className="box__input box__input--address"
                      placeholder="Address Line 1"
                      value={addressObject?.address_1 || ''}
                      type="text"
                      disabled
                    />
                    <input
                      className="box__input box__input--address"
                      placeholder="Address Line 2"
                      value={addressObject?.address_2 || ''}
                      type="text"
                      disabled
                    />
                    <input
                      className="box__input box__input--address"
                      placeholder="Postal Code"
                      value={data.quotationInfo?.postal_code || ''}
                      type="text"
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div className="createClaim__section">
                <div className="createClaim__formData createClaim__formData--textArea">
                  <label>Project Description</label>
                  <textarea
                    className="createClaim__input createClaim__input--textArea"
                    placeholder="Project Description"
                    name="description"
                    value={data.quotationInfo?.description || ''}
                    disabled
                  />
                </div>
              </div>
            </>
          }
          {data.isEditMode &&
            <div className={`createClaim__section${isEditAllowed ? '' : ' createClaim__section--disabled'}`}>
              <div className="createClaim__formData">
                <label>Payment Received Date</label>
                <DatePicker
                  disabled={data.isCopied}
                  selected={data.receivedDate || ''}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  onChangeRaw={handleDateChangeRaw}
                  onChange={(date) => handleSelectDate('received_date', date)}
                  className={`createClaim__input${data.messageError?.payment_received_date ? ' createClaim__input--error' : ''}`}
                />
                <img
                  className="createClaim__formData--icon"
                  src="/icons/calendar.svg"
                  alt="calendar"
                />
                {data.messageError?.payment_received_date &&
                  <p className="createClaim__error">
                    {data.messageError.payment_received_date}
                  </p>
                }
              </div>
              <div className="createClaim__formData">
                <label>Less Payment Received</label>
                <div className={`createClaim__input${data.isCopied ? ' createClaim__input--disabled' : ''}`}>
                  <div className="createClaim__symbol">$</div>
                  <PriceInputForm
                    isDisabled={data.isCopied}
                    inputValue={data.lessPaymentReceived}
                    field="actual_paid_amount"
                    placeholderTitle="0.00"
                    handleAmountChange={handleAmountChange}
                    handleClickOutAmount={handleClickOutAmount}
                  />
                </div>
                {data.messageError?.actual_paid_amount &&
                  <p className="createClaim__error">
                    {data.messageError.actual_paid_amount}
                  </p>
                }
              </div>
            </div>
          }
        </div>
      </div>
      {data.isEditMode &&
        <div className="quotationDetailTab__activity">
          <ActivityLogsForm
            logsNameList={ACTIVITY.LOGS.LABEL}
            actionNameList={ACTIVITY.LOGS.ACTION}
            logsData={data.claimLogs}
          />
        </div>
      }
    </div>
  )
}

export default DetailForm
