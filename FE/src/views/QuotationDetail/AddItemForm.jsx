import React from 'react'

const AddItemForm = ({ setIsShowScrapForm, setIsShowAddItemsForm, onCancel }) => {
  return (
    <div className="createItemForm createItemForm--addItemForm">
      <div className="createItemForm__inner">
        <p className="createItemForm__headerText">
          Add Items
        </p>
        <div className="addItemForm">
          <div className="addItemForm__block">
            <b className="createItemForm__label">
              ACTUAL MATERIAL NEEDED
            </b>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">WIDTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="1.50"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">WIDTH QUANTITY</div>
                <div className="addItemForm__input">
                  <input
                    type="text"
                  />
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">HEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="3.00"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">HEIGHT QUANTITY</div>
                <div className="addItemForm__input">
                  <input
                    type="text"
                  />
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL PERIMETER</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="9.00"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL WEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="13.977"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
              </div>
            </div>
          </div>
          <div className="addItemForm__block">
            <b className="createItemForm__label">
              RAW MATERIAL NEEDED
            </b>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">RAW LENGTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="5.80"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">RAW QUANTITY</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="2"
                    readOnly
                  />
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">RAW GIRTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="0.33"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL PERIMETER</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="9.00"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL WEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="13.977"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">COST OF RAW ALUMINIUM</div>
                <div className="addItemForm__input">
                  <input
                    type="text"
                    value="$52.20"
                  />
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF RAW ALUMINIUM</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="$104.40"
                    readOnly
                  />
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">COST OF POWDER COATING</div>
                <div className="addItemForm__input">
                  <input
                    type="text"
                  />
                  <div className="addItemForm__inputUnit">m2</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF POWDER COATING</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="$55.51"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF RAW MATERIAl</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="$159.91"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="addItemForm__block">
            <b className="createItemForm__label">
              SCRAP
            </b>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">SCRAP LENGTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="2.60"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">SCRAP WEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="4.04"
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">COST OF SCRAP</div>
                <div className="addItemForm__input">
                  <input
                    type="text"

                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF SCRAP</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value="$8.08"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="createItemForm__buttonWrapper createItemForm__buttonWrapper--addItem">
          <button
            className="createItemForm__button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="createItemForm__button"
            onClick={() => setIsShowScrapForm(true)}
          >
            Back
          </button>
          <button
            className="createItemForm__button createItemForm__button--brown"
            onClick={() => setIsShowScrapForm(false)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddItemForm
