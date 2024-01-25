import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { SIDEBAR_URLS, } from 'src/constants/config';
import { extractSecondNameInURL } from 'src/helper/helper';

import ArrowDownSvg from '../Icons/ArrowDownSvg';

const SideBar = ({ isShowSidebar }) => {
  const history = useHistory();

  const currentURL = history.location.pathname
  const baseURL = history.location.pathname?.split('/')[1]
  const subURL = extractSecondNameInURL(currentURL)

  const userStore = useSelector(state => state.user?.user)

  const [visibleSubLinkList, setVisibleSubLinkList] = useState([])

  const sidebarList = useMemo(() => {
    const permissions = userStore?.permission?.map((item) => Object.keys(item)[0]) || []
    if (permissions.length > 0) {
      return SIDEBAR_URLS.map(item => (
        item.list && item.list.some(category => permissions.includes(category.key)))
        ? (
          { ...item, list: item.list.filter(sidebarItem => permissions.includes(sidebarItem.key)) }
        ) : null)
    }
    return []
  }, [userStore])

  useEffect(() => {
    if (currentURL === '/inventory') {
      history.push('/inventory/materials')
    }
  }, [currentURL])

  useEffect(() => {
    if (baseURL === 'inventory') {
      setVisibleSubLinkList([...visibleSubLinkList, '/inventory'])
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

  const renderSideBarList = (data, index) => {
    return (
      data &&
      <div key={`caption-` + index}>
        <div className="sidebar__title">{data.caption}</div>
        {data.list.map((item, itemIndex) => (
          <div key={`key-` + itemIndex}>
            <Link
              to={item.link}
              onClick={() => handleClickShowSubLink(item.link)}
              className={`sidebar__link${baseURL === item.link?.slice(1) ? ' sidebar__link--active' : ''}`}
            >
              <div className={currentURL === item.link ? 'sidebar__icon' : ''}>
                {item.icon}</div>
              <div className="sidebar__text">{item.title}</div>
              {item.sub?.length > 0 &&
                <div className="sidebar__toggle">
                  {baseURL !== item.link?.slice(1) ?
                    <img
                      src="/icons/arrow_down.svg"
                      alt="arrow down"
                      width="10"
                      height="7"
                    /> : <ArrowDownSvg />
                  }
                </div>
              }
            </Link>
            {(item.sub?.length > 0 && visibleSubLinkList.includes(item.link)) && (
              <>
                {item.sub.map((sub, subIndex) => (
                  <div
                    className="subLink"
                    key={'sub-' + subIndex}
                    onClick={() => handleSelectSubSite(sub.link)}
                  >
                    <div className="subLink__content">
                      <div className={`subLink__title${subURL === sub.key ? ' subLink__title--active' : ''}`}>
                        {sub.title}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

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
