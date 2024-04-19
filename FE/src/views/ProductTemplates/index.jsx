import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useAlertSlice } from 'src/slices/alert'
import { useProductSlice } from 'src/slices/product'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { ACTIONS, ALERT, FILTER, INVENTORY, LINKS, MESSAGE, PAGINATION, PERMISSION, TEMPLATE } from 'src/constants/config'
import { normalizeString } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const ProductTemplates = () => {
  const { actions } = useProductSlice()
  const { actions: alertActions } = useAlertSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.product.list)
  const fetched = useSelector(state => state.product.fetched)
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
  const [selectedProfileFilter, setSelectedProfileFilter] = useState([])
  const [selectedInventoryAction, setSelectedInventoryAction] = useState({});
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

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
      profile: selectedProfileFilter,
      search: normalizeString(searchText),
      onError,
    }
    dispatch(actions.getProductList(params))
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getProductList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    return () => {
      dispatch(actions.resetFetchedList())
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowFilterModal(false);
        setIsShowConfirmDeleteModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
  }, [isFiltering, selectedProfileFilter])

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
    if (selectedProfileFilter?.length > 0) {
      params.profile = selectedProfileFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }

    dispatch(actions.getProductList(params));
  }

  const handleSearch = () => {
    handleFilterSearchApply(normalizeString(searchText))
    setSelectedIds([])
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
      dispatch(actions.getProductList({ ...params, onError, onSuccess }));
      if (params.category?.length > 0 || params.profile?.length > 0) {
        setIsFiltering(true)
      }
      setSelectedIds([]);
      setIsDisableSubmit(true);
      setSubmitting(true);
      setMessageError('');
      setIsShowFilterModal(false);
    }
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setIsFiltering(false)
    setSelectedProfileFilter([])
    setIsShowFilterModal(false)
    setCurrentPageNumber(PAGINATION.START_PAGE)
    dispatch(actions.getProductList({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
      onError,
    }));
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickDelete = (item) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.TEMPLATE, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (isDisableSubmit) return;
      const isDeletable = +item.product_item_use === INVENTORY.UN_USED_VALUE;
      if (isDeletable) {
        setSelectedDeleteIds([item.id])
        setIsShowConfirmDeleteModal(true);
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          isHovered: false,
          description: INVENTORY.MESSAGE_ERROR.TEMPLATE_USED,
        }))
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
      setMessageError({})
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
      dispatch(actions.multiDeleteProduct({
        product_template_ids: selectedDeleteIds,
        onDeleteSuccess,
        onError
      }));
    }
  }

  const handleCheckHasNoUsedMaterial = (id, data) => {
    const item = data.find(item => item.id === id);
    return item && +item.product_item_use === INVENTORY.UN_USED_VALUE;
  };

  const handleClickApply = (actionType) => {
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.TEMPLATE, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          const hasNoUsedItem = selectedIds.every(id => handleCheckHasNoUsedMaterial(id, list.data));

          if (hasNoUsedItem) {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(false)
          } else {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                TEMPLATE.MESSAGE_ERROR.INCLUDE_USED_ITEM : TEMPLATE.MESSAGE_ERROR.TEMPLATE_USED,
            }))
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }

      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportProductCSV({
          search: normalizeString(searchText),
          profile: selectedProfileFilter || [],
          product_template_ids: selectedIds || [],
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

  const handleClickCancelFilterModal = () => {
    setIsShowFilterModal(false)
    if (!isFiltering) {
      setSelectedProfileFilter([])
    }
  }

  const goToEditPage = (item) => {
    if (item) {
      history.push(`/inventory/product-templates/${item.id}`)
    }
  }

  const renderTableList = () => {
    return list.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const profileName = INVENTORY.PROFILES[data.profile]?.label
      return (
        <tr key={index} className={isChecked ? 'productTable__selected' : ''}>
          <td className="productTable__td productTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="productTable__td">
            <div className="productTable__td--textBox">
              {profileName || ''}
            </div>
          </td>
          <td className="productTable__td">
            <div className="productTable__td--textBox">
              {data.item || ''}
            </div>
          </td>
          <td className="productTable__td">
            <div className="productTable__td--buttons">
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
    <div className="product">
      <TableAction
        searchText={searchText}
        isFiltering={isFiltering}
        selectedItem={selectedItem}
        selectedInventoryAction={selectedInventoryAction}
        setSelectedItem={setSelectedItem}
        actionList={ACTIONS.MAIN}
        totalQuantity={totalDataNumber}
        selectedQuantity={selectedIds?.length || null}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setIsShowFilterModal={setIsShowFilterModal}
        setSelectedInventoryAction={setSelectedInventoryAction}
        createURL={LINKS.CREATE.TEMPLATE}
        buttonTitle="New Template"
        tableUnit="template"
        permissionKey={PERMISSION.KEY.TEMPLATE}
      />
      <div className="product__table">
        <table className="productTable">
          <thead>
            <tr>
              <th className="productTable__th productTable__th--checkBox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="productTable__th productTable__th--profile">PROFILE</th>
              <th className="productTable__th productTable__th--product">PRODUCT</th>
              <th className="productTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderTableList()}
          </tbody>
        </table>
      </div>
      <div className="product__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="product"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          isDocumentFilter={true}
          isHiddenSortOption={true}
          filterTitle="SORT CATEGORY BY"
          submitting={submitting}
          searchText={searchText}
          messageError={messageError}
          filterRequest={FILTER.INVENTORY}
          isDisableSubmit={isDisableSubmit}
          selectedProfileFilter={selectedProfileFilter}
          onClickApply={handleFilterSearchApply}
          onClickCancel={handleClickCancelFilterModal}
          handleClickResetFilter={handleClickResetFilter}
          handleSelectProfileFilter={handleSelectProfileFilter}
        />
      )}
    </div>
  )
}

export default ProductTemplates
