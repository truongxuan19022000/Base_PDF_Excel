import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import SquareMetersUnitModal from './SquareMetersUnitModal'
import PiecesUnitModal from './PiecesUnitModal'
import MetersUnitModal from './MetersUnitModal'
import PanelUnitModal from './PanelUnitModal'
import AddAluminium from './AddAluminium'

import { INVENTORY, QUOTATION } from 'src/constants/config'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'

const EditProductItem = ({
  id,
  setIsShowModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice()

  const selectedItem = useSelector(state => state.quotationSection.selectedItem)

  const [isShowAddItemsForm, setIsShowAddItemsForm] = useState(true)

  const handleClickCancel = () => {
    setIsShowModal(false)
    setIsShowAddItemsForm(false)
  }

  useEffect(() => {
    return () => {
      dispatch(actions.clearSelectedProduct())
      dispatch(actions.handleResetSelectedItem())
      dispatch(actions.handleResetSelectedProductItem())
    }
  }, [])

  const renderEditItemModal = () => {
    if (selectedItem.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM) {
      return <AddAluminium
        id={id}
        isEdit={true}
        handleCancel={handleClickCancel}
        setIsShowAddItemsForm={setIsShowAddItemsForm}
      />
    }
    switch (selectedItem.cost_unit) {
      case INVENTORY.QUANTITY_UNIT[1].value: {
        return <PiecesUnitModal
          id={id}
          isEdit={true}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      case INVENTORY.QUANTITY_UNIT[2].value: {
        return <SquareMetersUnitModal
          id={id}
          isEdit={true}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      case INVENTORY.QUANTITY_UNIT[3].value: {
        return <MetersUnitModal
          id={id}
          isEdit={true}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      case INVENTORY.QUANTITY_UNIT[4].value: {
        return <PanelUnitModal
          id={id}
          isEdit={true}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      default: {
        return null
      }
    }
  }

  return (
    <div className="addItemWindow">
      {renderEditItemModal()}
    </div>
  )
}

export default EditProductItem
