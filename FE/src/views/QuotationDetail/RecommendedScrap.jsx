import React from 'react'

const RecommendedScrap = ({ setIsShowScrapForm, setIsShowAddItemsForm, onCancel }) => {
  return (
    <div className="createItemForm createItemForm--scrap">
      <div className="createItemForm__inner">
        <p className="createItemForm__headerText">
          Add Items
        </p>
        <b className="createItemForm__label">
          RECOMMENDED SCRAP TO USE
        </b>
        <table className="scrapTable">
          <thead>
            <tr>
              <th>SCRAP FROM</th>
              <th>PRODUCT CODE</th>
              <th>ITEM</th>
              <th>SCRAP LENGTH</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Alum framing - sliding door</th>
              <th>W08</th>
              <th>Outer - 2 Tracks</th>
              <th>2.6 m (m&sup2;)</th>
              <th className="scrapTable__thAction">USE</th>
            </tr>
            <tr>
              <th>Alum framing - sliding door</th>
              <th>W08</th>
              <th>Outer - 2 Tracks</th>
              <th>2.6 m (m&sup2;)</th>
              <th className="scrapTable__thAction">USE</th>
            </tr>
            <tr>
              <th>Alum framing - sliding door</th>
              <th>W08</th>
              <th>Outer - 2 Tracks</th>
              <th>2.6 m (m&sup2;)</th>
              <th className="scrapTable__thAction">USE</th>
            </tr>
            <tr>
              <th>Alum framing - sliding door</th>
              <th>W08</th>
              <th>Outer - 2 Tracks</th>
              <th>2.6 m (m&sup2;)</th>
              <th className="scrapTable__thAction">USE</th>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="createItemForm__buttonWrapper createItemForm__buttonWrapper--scrap">
        <button
          className="createItemForm__button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="createItemForm__button"
          onClick={() => setIsShowAddItemsForm(false)}
        >
          Back
        </button>
        <button
          className="createItemForm__button createItemForm__button--brown"
          onClick={() => setIsShowScrapForm(false)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default RecommendedScrap
