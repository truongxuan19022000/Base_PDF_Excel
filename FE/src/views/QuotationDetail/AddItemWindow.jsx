import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import SelectSearchForm from 'src/components/SelectSearchForm'
import RecommendedScrap from './RecommendedScrap'
import AddItemForm from './AddItemForm'

const AddItemWindow = () => {
  const history = useHistory()
  const [isShowAddItemsForm, setIsShowAddItemsForm] = useState(false)
  const [isShowScrapForm, setIsShowScrapForm] = useState(true)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [selectedItemTitle, setSelectedItemTitle] = useState('')
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [messageError, setMessageError] = useState('')
  const slideModifiedClassName = useMemo(() => {
    if (isShowAddItemsForm) {
      if (isShowScrapForm) {
        return 'addItemWindow__slide--scrap'
      }
      return 'addItemWindow__slide--addItems'
    }
    return ''
  }, [isShowScrapForm, isShowAddItemsForm])

  const handleTypeSearchChange = useCallback((e) => {
    setSearchText(e.target.value)
  }, [])

  return (
    <div className='addItemWindow'>
      <div className={`addItemWindow__slide ${slideModifiedClassName}`}>
        <div className="addItemWindow__inner">
          <div className="createItemForm">
            <div className="createItemForm__inner">
              <p className="createItemForm__headerText">
                Add Items
              </p>
              <div className="createItemForm__formGroup">
                <label className="createItemForm__label">
                  PRODUCT TEMPLATE
                </label>
                <SelectSearchForm
                  displayProperty="item"
                  validSelectProperty="id"
                  placeHolderLabel="Select Product Template"
                  searchText={searchText}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  selectedItem={selectedTemplates}
                  isInputChanged={isInputChanged}
                  selectedItemTitle={selectedItemTitle}
                  messageError={messageError}
                  setSearchText={setSearchText}
                  setSelectedItem={setSelectedTemplates}
                  setIsInputChanged={setIsInputChanged}
                  setIsDisableSubmit={setIsDisableSubmit}
                  setSelectedItemTitle={setSelectedItemTitle}
                  handleTypeSearchChange={handleTypeSearchChange}
                />
              </div>
              <div className="createItemForm__formGroup">
                <label className="createItemForm__label">
                  ITEM
                </label>
                <SelectSearchForm
                  displayProperty="item"
                  validSelectProperty="id"
                  placeHolderLabel="Select Product Template"
                  searchText={searchText}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  selectedItem={selectedTemplates}
                  isInputChanged={isInputChanged}
                  selectedItemTitle={selectedItemTitle}
                  messageError={messageError}
                  setSearchText={setSearchText}
                  setSelectedItem={setSelectedTemplates}
                  setIsInputChanged={setIsInputChanged}
                  setIsDisableSubmit={setIsDisableSubmit}
                  setSelectedItemTitle={setSelectedItemTitle}
                  handleTypeSearchChange={handleTypeSearchChange}
                />
              </div>
              <div className="createItemForm__formGroup">
                <label className="createItemForm__label">
                  ITEM CODE
                </label>
                <div className="createItemForm__input createItemForm__input--inActive">
                  <input type="text" readOnly />
                </div>
              </div>
              <div className="createItemForm__formGroup">
                <label className="createItemForm__label">
                  SIDE
                </label>
                <div className="createItemForm__input createItemForm__input--inActive">
                  <input type="text" readOnly />
                </div>
              </div>
              <div className="createItemForm__buttonWrapper">
                <button
                  className="createItemForm__button"
                  onClick={history.goBack}
                >
                  Cancel
                </button>
                <button
                  className="createItemForm__button createItemForm__button--brown"
                  onClick={() => setIsShowAddItemsForm(true)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="addItemWindow__inner">
          <RecommendedScrap
            setIsShowScrapForm={setIsShowScrapForm}
            setIsShowAddItemsForm={setIsShowAddItemsForm}
            onCancel={history.goBack}
          />
        </div>
        <div className="addItemWindow__inner addItemWindow__inner--addItems">
          <AddItemForm
            setIsShowScrapForm={setIsShowScrapForm}
            setIsShowAddItemsForm={setIsShowAddItemsForm}
            onCancel={history.goBack}
          />
        </div>
      </div>
    </div>
  )
}

export default AddItemWindow
