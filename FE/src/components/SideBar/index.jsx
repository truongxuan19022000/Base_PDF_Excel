import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import { CCollapse } from '@coreui/react';
import { Link, useHistory } from 'react-router-dom';

import { INVENTORY_KEY, INVENTORY_SUB_LINKS, INVENTORY_URL, SIDEBAR_URLS, } from 'src/constants/config';
import { extractSecondNameInURL } from 'src/helper/helper';

import ArrowDownSvg from '../Icons/ArrowDownSvg';

const SideBar = ({ isShowSidebar }) => {
  const history = useHistory();

  const currentURL = history.location.pathname
  const baseURL = history.location.pathname?.split('/')[1]
  const subURL = extractSecondNameInURL(currentURL)

  const permissionData = useSelector(state => state.user.permissionData)

  const [visibleSubLinkList, setVisibleSubLinkList] = useState([])

  const allowedPermission = useMemo(() => {
    return permissionData.filter(item => {
      const key = Object.keys(item)[0];
      const values = Object.values(item[key]);
      const allZero = values.every(value => value === 0);
      return !allZero;
    }) || [];
  }, [permissionData]);

  // add inventory key into permission if it includes inventory sub_links
  const updatedPermissions = useMemo(() => {
    const permissionKeys = allowedPermission.map((item) => Object.keys(item)[0]) || [];
    const isIncludeInventory = permissionKeys.some(item => INVENTORY_SUB_LINKS.includes(item));
    return isIncludeInventory ? [...permissionKeys, INVENTORY_KEY] : permissionKeys;
  }, [allowedPermission]);

  const sidebarList = useMemo(() => {
    let filteredSidebarList = [];

    SIDEBAR_URLS.forEach(item => {
      const isIncludeMainKey = item.list && item.list.some(category => updatedPermissions.includes(category.key));
      const isIncludeSubKey = item.sub && item.sub.some(subItem => updatedPermissions.includes(subItem.key));

      if (isIncludeMainKey || isIncludeSubKey) {
        const updatedItem = { ...item };
        // filter main link item
        if (updatedItem.list) {
          updatedItem.list = updatedItem.list.filter(sidebarItem => updatedPermissions.includes(sidebarItem.key));
        }

        // filter sub link item
        if (updatedItem.list && updatedItem.list.length > 0) {
          updatedItem.list.forEach(category => {
            if (category.sub) {
              category.sub = category.sub.filter(subItem => updatedPermissions.includes(subItem.key));
            }
          });
        }

        filteredSidebarList.push(updatedItem);
      }
    });

    return filteredSidebarList;
  }, [updatedPermissions]);

  useEffect(() => {
    if (baseURL === INVENTORY_KEY) {
      setVisibleSubLinkList([INVENTORY_URL])
    }
  }, [baseURL])

  const handleClickShowSubLink = (link) => {
    if (baseURL !== link.split('/')[1]) return;
    if (visibleSubLinkList.includes(link)) {
      setVisibleSubLinkList(visibleSubLinkList.filter(item => item !== link))
    } else {
      setVisibleSubLinkList([...visibleSubLinkList, link])
    }
  }

  const handleSelectSubSite = (site) => {
    if (site) {
      history.push(`${site}`)
    }
  }

  const renderSubLinks = (item) => {
    return item?.sub?.map((sub, subIndex) => (
      <div
        className="subLink"
        key={`sub-${subIndex}`}
        onClick={() => handleSelectSubSite(sub.link)}
      >
        <div className={`subLink__title${subURL === sub.subLink ? ' subLink__title--active' : ''}`}>
          {sub.title}
        </div>
      </div>
    ));
  };

  const renderMainLink = (item, itemIndex) => (
    <div key={`item-${itemIndex}`}>
      <Link
        to={item.sub?.length > 0 ? item.sub[0].link : item.link}
        onClick={() => handleClickShowSubLink(item.link)}
        className={`sidebar__link${baseURL === item.link?.slice(1) ? ' sidebar__link--active' : ''}`}
      >
        <div className={currentURL === item.link ? 'sidebar__icon' : ''}>
          {item.icon}
        </div>
        <div className="sidebar__text">{item.title}</div>
        {item.sub?.length > 0 && (
          <div className="sidebar__toggle">
            {baseURL !== item.link?.slice(1) ? (
              <img
                src="/icons/arrow_down.svg"
                alt="arrow down"
                width="10"
                height="7"
              />
            ) : (
              <ArrowDownSvg />
            )}
          </div>
        )}
      </Link>
      <CCollapse show={item.sub?.length > 0 && visibleSubLinkList.includes(item.link)}>
        <div className="sidebar__subLinks">
          {renderSubLinks(item)}
        </div>
      </CCollapse>
    </div>
  );

  const renderSideBarList = (data, index) => {
    return (
      data && (
        <div key={`caption-${index}`}>
          <div className="sidebar__title">{data.caption}</div>
          {data.list.map((item, itemIndex) => renderMainLink(item, itemIndex))}
        </div>
      )
    );
  };

  return (
    <div className={`sidebar${isShowSidebar ? '' : ' sidebar__hidden'}`}>
      <div className="sidebar__header">
        <img className="sidebar__logo" src="/icons/logo.webp" alt="logo" />
      </div>
      <div className="sidebar__content">
        <div className="sidebar__title">{SIDEBAR_URLS[0].caption}</div>
        {SIDEBAR_URLS[0]?.list?.map((item, index) => (
          <Link
            key={index}
            className={`sidebar__link${baseURL === item.link?.slice(1) ? ' sidebar__link--active' : ''}`}
            to={item.link}
          >
            <div className={currentURL === item.link ? 'sidebar__icon' : ''}>
              {item.icon}</div>
            <div className="sidebar__text">{item.title}</div>
          </Link>
        ))}
        {sidebarList.map((data, index) => renderSideBarList(data, index))}
      </div>
    </div>
  )
}

export default SideBar
