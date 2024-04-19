import React, { useMemo, useState } from 'react'

import ClaimBottom from './ClaimBottom'
import ClaimViewDraggableItem from 'src/components/ClaimViewDraggableItem'
import ClaimFeeDraggableItem from 'src/components/ClaimViewDraggableItem/ClaimFeeDraggableItem'
import ClaimDiscountDraggableItem from 'src/components/ClaimViewDraggableItem/ClaimDiscountDraggableItem'

import { isEmptyObject } from 'src/helper/helper'

const ClaimView = ({
  isCopied = false,
  claimTabInfo = {},
  setIsShowGSTModal,
  setIsShowEditClaimModal,
  setIsShowPreviousAmountModal,
}) => {
  const [sectionList, setSectionList] = useState([])

  const moveSection = (fromIndex, toIndex) => {
    const updatedSectionData = [...sectionList];
    const [removedSection] = updatedSectionData.splice(fromIndex, 1);
    updatedSectionData.splice(toIndex, 0, removedSection);
    setSectionList(updatedSectionData);
  };

  const handleDragAndDropSection = () => {
    const updatedSectionListOrder = [...sectionList].map((section, index) => ({
      id: section.id,
      section_name: section.section_name,
      order_number: index + 1
    }));
  }

  const [quotationSections, fees, discount] = useMemo(() => {
    if (isEmptyObject(claimTabInfo?.quotation)) return [null, null];
    const fees = claimTabInfo.quotation.other_fees;
    const sections = claimTabInfo.quotation.quotation_sections;
    const discount = claimTabInfo.quotation.discount;
    return [sections, fees, discount];
  }, [claimTabInfo?.quotation]);

  return (
    <div className="tabClaim">
      <div className="tabClaim__innerBox">
        <div className="tabClaim__sections">
          <div className="tabClaim__sections--dropArea">
            <div className="tabClaim__dragContainer">
              {quotationSections?.map((item, index) => (
                <div key={index}>
                  <ClaimViewDraggableItem
                    index={index}
                    data={item}
                    isCopied={isCopied}
                    handleDragAndDropSection={handleDragAndDropSection}
                    moveSection={moveSection}
                    setIsShowEditClaimModal={setIsShowEditClaimModal}
                  />
                </div>
              ))}
            </div>
            <div className="tabClaim__divider"></div>
            <div className="tabClaim__dragContainer tabClaim__dragContainer--fee">
              <ClaimFeeDraggableItem
                data={fees}
                isCopied={isCopied}
                handleDragAndDropSection={handleDragAndDropSection}
                moveSection={moveSection}
                setIsShowEditClaimModal={setIsShowEditClaimModal}
              />
            </div>
            {+discount?.discount_amount > 0 &&
              <>
                <div className="tabClaim__divider"></div>
                <div className="tabClaim__dragContainer tabClaim__dragContainer--fee">
                  <ClaimDiscountDraggableItem
                    data={discount}
                    isCopied={isCopied}
                    handleDragAndDropSection={handleDragAndDropSection}
                    moveSection={moveSection}
                    setIsShowEditClaimModal={setIsShowEditClaimModal}
                  />
                </div>
              </>
            }
          </div>
        </div>
      </div>
      <div className="tabClaim__bottom">
        <ClaimBottom
          isCopied={isCopied}
          setIsShowGSTModal={setIsShowGSTModal}
          setIsShowPreviousAmountModal={setIsShowPreviousAmountModal}
        />
      </div>
    </div>
  )
}

export default ClaimView
