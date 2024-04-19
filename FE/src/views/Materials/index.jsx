import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { alertActions } from 'src/slices/alert'
import { useMaterialSlice } from 'src/slices/material'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { ACTIONS, ALERT, FILTER, INVENTORY, MATERIAL, MESSAGE, PAGINATION, PERMISSION } from 'src/constants/config'
import { formatCurrency, normalizeString } from 'src/helper/helper'

import UploadCSVModal from './UploadCSVModal'
import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const Materials = () => {
  const { actions } = useMaterialSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const { list, fetched } = useSelector(state => state.material)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [messageError, setMessageError] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null);
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState([])
  const [selectedProfileFilter, setSelectedProfileFilter] = useState([])
  const [selectedInventoryAction, setSelectedInventoryAction] = useState({});
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);
  const [isShowUploadCSVModal, setIsShowUploadCSVModal] = useState(false);

  const onSuccess = () => {
    setMessageError({})
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
  }

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = list.current_page === list.last_page
    const hasNoItem = list.data.every(item => selectedDeleteIds.includes(item.id))
    let tempoPageNumber = currentPageNumber;

    // set to prev page if current page is last page and there has no item
    if (isLastPage && hasNoItem) {
      tempoPageNumber = currentPageNumber - 1;
    }
    const params = {
      page: +tempoPageNumber <= 0 ? 1 : +tempoPageNumber,
      search: normalizeString(searchText),
      category: selectedFieldFilter,
      profile: selectedProfileFilter,
      onError,
    }
    dispatch(actions.getCustomerList(params))
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getMaterialList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    return () => {
      dispatch(actions.resetFetchedList())
    }
  }, [])

  useEffect(() => {
    if (list && Object.keys(list).length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (messageError && Object.keys(messageError).length > 0) {
      const timer = setTimeout(() => setMessageError({}), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageError]);

  useEffect(() => {
    if (messageError?.length > 0) {
      setIsErrorExist(true)
    } else {
      setIsErrorExist(false)
    }
  }, [messageError])

  useEffect(() => {
    if (!isFiltering) {
      setSubmitting(false)
      setMessageError(null)
      setIsDisableSubmit(false)
    }
  }, [isFiltering])

  useEffect(() => {
    if (!isShowUploadCSVModal) {
      setMessageError({})
      setSelectedInventoryAction({})
    }
  }, [isShowUploadCSVModal])

  useEffect(() => {
    if (selectedIds?.length === list.data?.length && list.data?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, list.data])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged, isShowFilterModal])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowFilterModal(false);
        setIsShowUploadCSVModal(false);
        setIsShowConfirmDeleteModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(list.data?.map(item => item.id) || [])
    } else {
      setSelectedIds([]);
    }
  }

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])
    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }
    if (selectedFieldFilter?.length > 0) {
      params.category = selectedFieldFilter;
    }
    if (selectedProfileFilter?.length > 0) {
      params.profile = selectedProfileFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }

    dispatch(actions.getMaterialList(params));
  }

  const handleSearch = () => {
    if (isDisableSubmit) return;
    const params = {
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
    };

    if (selectedFieldFilter?.length > 0) {
      params.category = selectedFieldFilter;
    };

    if (selectedProfileFilter?.length > 0) {
      params.profile = selectedProfileFilter;
    };

    dispatch(actions.getMaterialList({ ...params, onError, onSuccess }));
    setSelectedIds([])
  }

  const handleSelectFieldFilter = (value) => {
    if (submitting) return;
    if (selectedFieldFilter.includes(value)) {
      setSelectedFieldFilter(selectedFieldFilter.filter(id => id !== value) || []);
    } else {
      setSelectedFieldFilter([...selectedFieldFilter, value]);
    }
    setIsInputChanged(!isInputChanged)
  }

  const handleSelectProfileFilter = (itemId) => {
    if (submitting || !itemId) return;
    if (selectedProfileFilter?.includes(itemId)) {
      setSelectedProfileFilter(selectedProfileFilter?.filter(id => id !== itemId) || [])
    } else {
      setSelectedProfileFilter([...selectedProfileFilter, itemId])
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleFilterSearchApply = (searchText) => {
    if (isErrorExist || isDisableSubmit) return;
    const params = {
      page: PAGINATION.START_PAGE,
    };

    if (selectedFieldFilter?.length > 0) {
      params.category = selectedFieldFilter;
    };

    if (selectedProfileFilter?.length > 0) {
      params.profile = selectedProfileFilter;
    };

    if (searchText?.length > 0) {
      params.search = searchText;
    };

    const errors = validateFilterRequest(params);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.getMaterialList({ ...params, onError, onSuccess }));
      if (params.category?.length > 0 || params.profile?.length > 0) {
        setIsFiltering(true)
      }
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsShowFilterModal(false);
    }
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setIsFiltering(false)
    setSelectedFieldFilter([])
    setSelectedProfileFilter([])
    setIsShowFilterModal(false)
    setCurrentPageNumber(PAGINATION.START_PAGE)
    dispatch(actions.getMaterialList({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
      onError,
    }));
  }

  const handleClickDelete = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.MATERIAL, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      const isUsed = data.product_item_use !== INVENTORY.UN_USED_VALUE;
      const isInTemplate = data.product_template_use !== INVENTORY.UN_USED_VALUE;

      if (isUsed) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MATERIAL.MESSAGE_ERROR.QUOTATION_USED,
        }))
      } else if (isInTemplate) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MATERIAL.MESSAGE_ERROR.TEMPLATE_USED,
        }))
      } else {
        setSelectedDeleteIds([data.id])
        setIsShowConfirmDeleteModal(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleAcceptedDelete = () => {
    if (isDisableSubmit) return;
    if (selectedDeleteIds.length === 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Deletion Failed',
        isHovered: false,
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    } else {
      dispatch(actions.multiDeleteMaterial({
        material_ids: selectedDeleteIds,
        onDeleteSuccess,
        onError
      }));
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleCheckHasNoUsedMaterial = (id, data) => {
    const item = data.find(item => item.id === id);
    return item && +item.is_copied === INVENTORY.UN_USED_VALUE;
  };

  const handleCheckHasNotSelectedMaterial = (id, data) => {
    const item = data.find(item => item.id === id);
    return item && +item.status === INVENTORY.UN_USED_VALUE;
  };

  const getDescription = (isUsed, isSelected, length) => {
    if (isUsed) {
      return length > 1 ?
        MATERIAL.MESSAGE_ERROR.INCLUDE_USED_ITEM : MATERIAL.MESSAGE_ERROR.QUOTATION_USED;
    } else if (!isSelected) {
      return length > 1 ? MATERIAL.MESSAGE_ERROR.TEMPLATE_USED : MATERIAL.MESSAGE_ERROR.QUOTATION_USED;
    }
  };

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickApply = (actionType) => {
    if (!actionType) return;
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.MATERIAL, PERMISSION.ACTION.DELETE)

        if (isAllowed) {
          const hasNoUsed = selectedIds.every(id => handleCheckHasNoUsedMaterial(id, list.data));
          const hasNotSelected = selectedIds.every(id => handleCheckHasNotSelectedMaterial(id, list.data));

          if (hasNoUsed && hasNotSelected) {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          } else {
            const description = getDescription(!hasNoUsed, !hasNotSelected, selectedIds.length);

            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: description,
            }));
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }

      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportMaterialCSV({
          material_ids: selectedIds,
          onError
        }))
        setSelectedItem({})
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    }
  }

  const handleSelectInventoryAction = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.MATERIAL, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      if (data.value === MATERIAL.UPLOAD_FILE_VALUE) {
        setIsShowUploadCSVModal(true)
        setSelectedInventoryAction(data)
      } else {
        history.push(`/inventory/materials/create/?category=${data.url}`)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickCancelFilterModal = () => {
    setIsShowFilterModal(false)
    if (!isFiltering) {
      setSelectedFieldFilter([])
      setSelectedProfileFilter([])
    }
  }

  const goToEditPage = (item) => {
    if (item) {
      const category = item.category.toLowerCase()
      history.push(`/inventory/materials/${item.id}/?category=${category}`)
    }
  }

  const renderTableList = () => {
    return list.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const profileName = INVENTORY.PROFILES[data.profile]?.label
      const priceUnit = INVENTORY.PRICE_UNIT[data.price_unit]?.label
      return (
        <tr key={index} className={isChecked ? 'materialTable__selected' : ''}>
          <td className="materialTable__td materialTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="materialTable__td">
            <div className="materialTable__td--textBox materialTable__td--category">
              {data.category || ''}
            </div>
          </td>
          <td className="materialTable__td">
            <div className="materialTable__td--textBox">
              {profileName || ''}
            </div>
          </td>
          <td className="materialTable__td">
            <div className="materialTable__td--textBox">
              {data.item || ''}
            </div>
          </td>
          <td className="materialTable__td">
            <div className="materialTable__td--textBox">
              {data.code || ''}
            </div>
          </td>
          <td className="materialTable__td">
            <div className="materialTable__td--textBox">
              S$ {formatCurrency(data.price)} / {priceUnit.slice(1)}
            </div>
          </td>
          <td className="materialTable__td">
            <div className="materialTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                isInventory={true}
                clickEdit={goToEditPage}
                clickDelete={() => handleClickDelete(data)}
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="material">
      <TableAction
        isInventorySite={true}
        searchText={searchText}
        isFiltering={isFiltering}
        selectedItem={selectedItem}
        selectedInventoryAction={selectedInventoryAction}
        setSelectedItem={setSelectedItem}
        actionList={ACTIONS.MAIN || []}
        totalQuantity={totalDataNumber || 0}
        selectedQuantity={selectedIds?.length || null}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setIsShowFilterModal={setIsShowFilterModal}
        setSelectedInventoryAction={handleSelectInventoryAction}
        tableUnit="item"
        permissionKey={PERMISSION.KEY.MATERIAL}
      />
      <div className="material__table">
        <table className="materialTable">
          <thead>
            <tr>
              <th className="materialTable__th materialTable__th--checkBox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="materialTable__th materialTable__th--category">CATEGORY</th>
              <th className="materialTable__th materialTable__th--profile">PROFILE</th>
              <th className="materialTable__th materialTable__th--item">ITEM</th>
              <th className="materialTable__th materialTable__th--code">CODE</th>
              <th className="materialTable__th materialTable__th--price">PRICE</th>
              <th className="materialTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderTableList()}
          </tbody>
        </table>
      </div>
      <div className="material__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="item"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          filterTitle="SORT CATEGORY BY"
          submitting={submitting || false}
          isDocumentFilter={true}
          searchText={searchText || ''}
          messageError={messageError || ''}
          filterRequest={FILTER.INVENTORY || []}
          selectedProfileFilter={selectedProfileFilter}
          isDisableSubmit={isDisableSubmit || false}
          selectedFieldFilter={selectedFieldFilter || ''}
          onClickApply={handleFilterSearchApply}
          handleSelectProfileFilter={handleSelectProfileFilter}
          handleClickResetFilter={handleClickResetFilter}
          handleSelectFieldFilter={handleSelectFieldFilter}
          onClickCancel={handleClickCancelFilterModal}
        />
      )}
      {isShowUploadCSVModal &&
        <UploadCSVModal
          closeModal={() => setIsShowUploadCSVModal(false)}
        />
      }
    </div>
  )
}

export default Materials
