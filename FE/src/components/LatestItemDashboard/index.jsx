import { formatDate, formatPriceWithTwoDecimals } from 'src/helper/helper';
import { DASHBOARD_STATUS, FILED_TYPES, STATUS_FIELD } from 'src/constants/config';

const LatestItemDashboard = ({ data, headers, statusField, tableTitle, createAction }) => {
  const renderTableRow = (rowData) => {
    return (
      <tr key={rowData.id}>
        {headers.map((head) => (
          <td key={head.field}>{renderTableField(head.fieldType, rowData[head.field])}</td>
        ))}
      </tr>
    );
  };

  const renderTableField = (fieldType, value) => {
    switch (fieldType) {
      case FILED_TYPES.RAW_TEXT: {
        return value;
      }
      case FILED_TYPES.PRICE_FORMAT: {
        return `$ ${formatPriceWithTwoDecimals(value)}`;
      }
      case FILED_TYPES.DATE_FORMAT: {
        return value ? formatDate(value) : '';
      }
      case FILED_TYPES.STATUS: {
        return displayStatus(value);
      }
      default: {
        return value;
      }
    }
  };

  const displayStatus = (value) => {
    if (statusField) {
      let className = '';
      let status = null;
      if (statusField === STATUS_FIELD.QUOTATION) {
        status = DASHBOARD_STATUS.QUOTATION.find((item) => item.value === +value);
      } else if (statusField === STATUS_FIELD.CLAIM) {
        status = DASHBOARD_STATUS.CLAIM.find((item) => item.value === +value);
      }
      className = status ? `status status--${status.class}` : '';
      return <div className={className}>{status ? status.label : ''}</div>;
    }
  };

  return (
    <div className="latestQuotation">
      <div className="latestQuotation__header">
        <div className="header__title">{`latest ${tableTitle}`}</div>
        <button className="header__addNew" onClick={() => createAction && createAction()}>
          <span>+</span>
          <span>{`new ${tableTitle}`}</span>
        </button>
      </div>
      <table className="latestQuotation__table">
        <thead>
          <tr>
            {headers.map((head) => (
              <th key={head.title}>{head.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>{data?.map((item) => renderTableRow(item))}</tbody>
      </table>
    </div>
  );
};

export default LatestItemDashboard;
