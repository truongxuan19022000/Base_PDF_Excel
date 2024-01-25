import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useProductSlice } from 'src/slices/product'
import { validateFilterRequest } from 'src/helper/validation'
import { ACTIONS, FILTER, INVENTORY, LINKS, MESSAGE, PAGINATION } from 'src/constants/config'
import { downloadCSVFromCSVString, extractSecondNameInURL, isEmptyObject, normalizeString } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import ActionMessageForm from 'src/components/ActionMessageForm'

const ProductTemplates = () => {
  const { actions } = useProductSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentURL = history.location.pathname

  const list = useSelector(state => state.product.list)
  const csvData = useSelector(state => state.product.csvData)
  const fetched = useSelector(state => state.product.fetched)

  const [message, setMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
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

  const onSuccess = () => {
    setMessageError({})
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    if (Object.keys(deleteInfo).length > 0) {
      setDeleteInfo({})
    }
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getProductList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (messageError && Object.keys(messageError)?.length > 0) {
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
    if (!isShowConfirmDeleteModal) {
      setDeleteInfo({})
      setIsDisableSubmit(false)
    }
  }, [isShowConfirmDeleteModal])

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged, isShowFilterModal])

  useEffect(() => {
    if (csvData?.length > 0 && submitting) {
      downloadCSVFromCSVString(csvData, extractSecondNameInURL(currentURL))
      setSubmitting(false)
      dispatch(actions.clearCSVData())
    }
  }, [submitting, csvData, currentURL])

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
      onSuccess, onError,
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
      setIsDisableSubmit(true);
    } else {
      dispatch(actions.getProductList({ ...params, onSuccess, onError, }));
      if (params.category?.length > 0 || params.profile?.length > 0) {
        setIsFiltering(true)
      }
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsDisableSubmit(true);
      setIsShowFilterModal(false);
    }
  }

  const handleClickResetFilter = () => {
    setSearchText('')
    setSelectedIds([])
    setIsFiltering(false)
    setSelectedProfileFilter([])
    setIsShowFilterModal(false)
    setCurrentPageNumber(PAGINATION.START_PAGE)
    dispatch(actions.getProductList({
      page: PAGINATION.START_PAGE,
      onSuccess, onError,
    }));
  }

  const handleSelectDeleteInfo = (actionType, deleteId) => {
    if (!actionType) return;
    if (actionType === ACTIONS.NAME.DELETE && deleteId) {
      setDeleteInfo({
        actionType: actionType,
        deleteIds: [deleteId],
      });
    } else if (actionType === ACTIONS.NAME.MULTI_DELETE && selectedIds?.length > 0) {
      setDeleteInfo({
        actionType: actionType,
        deleteIds: selectedIds || [],
      });
    } else {
      setMessage({
        failed: MESSAGE.ERROR.NO_DELETE_ID
      })
      return;
    }
    setIsShowConfirmDeleteModal(true);
  }

  const handleDelete = (deleteInfo) => {
    if (isDisableSubmit || !deleteInfo?.actionType) return;
    const isLastItem = (list.data?.length === 1)
    const isSelectAllItemOfLastPage = (isSelectedAll && list.current_page === list.last_page)
    const isOutOfItemInPage = isLastItem || isSelectAllItemOfLastPage
    let tempoPageNumber = null;
    if ((list.last_page > PAGINATION.START_PAGE) && isOutOfItemInPage) {
      tempoPageNumber = list.current_page - 1
    } else {
      tempoPageNumber = PAGINATION.START_PAGE
    }
    const data = {
      page: +tempoPageNumber,
      product_template_ids: deleteInfo?.deleteIds || [],
    };
    if (selectedProfileFilter?.length > 0) {
      data.profile = selectedProfileFilter;
    };
    if (searchText?.length > 0) {
      data.search = normalizeString(searchText);
    };
    setSubmitting(true)
    setMessageError({})
    setIsDisableSubmit(true)
    setIsShowConfirmDeleteModal(false)
    dispatch(actions.multiDeleteProduct({ ...data, onSuccess, onError }));
    if (deleteInfo?.actionType === ACTIONS.NAME.MULTI_DELETE) {
      setSelectedIds([])
    }
    if (deleteInfo?.deleteIds) {
      setSelectedIds(selectedIds?.filter(id => !data.product_template_ids?.includes(id)))
    }
  }

  const handleClickApply = (actionType) => {
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportProductCSV({
        search: normalizeString(searchText),
        profile: selectedProfileFilter || [],
        product_template_id: selectedIds || [],
        onError
      }))
      setSubmitting(true)
      setSelectedItem({})
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
      const isChecked = selectedIds?.includes(data.id)
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
                clickDelete={handleSelectDeleteInfo}
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="product">
      {!isEmptyObject(message) &&
        <div className="product__message">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
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
          onClickDelete={() => handleDelete(deleteInfo)}
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
