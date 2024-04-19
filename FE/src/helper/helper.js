import dayjs from 'dayjs';

import { LABEL_TYPE } from 'src/constants/config';

export const setToken = (name, value, time = null) => {
  if (value && time) {
    let d = new Date();
    d.setTime(d.getTime() + (time * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  } else if (value) {
    document.cookie = `${name}=${value};path=/`;
  } else {
    document.cookie = `${name}=;path=/`;
  }
}

export const getToken = (name) => {
  let cookies = (typeof document !== 'undefined' && document.cookie)
  const value = `; ${cookies}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts?.pop()?.split(';').shift()
}

export const normalizeString = (str) => {
  if (str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  } else {
    return '';
  }
}

export const handleFormData = (payload, form, parentKey, parentIndex) => {
  let formData = form || new FormData();

  if (parentKey && typeof payload !== 'object' && payload !== null) {
    formData.append(parentKey, payload);
    return formData;
  }

  Object.keys(payload).forEach((key, index) => {
    const value = payload[key];

    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((subValue, subIndex) => {
        formData = handleFormData(subValue, formData, key, subIndex);
      });
    } else if (typeof value === 'object' && value !== null) {
      formData = handleFormData(value, formData, key, index);
    } else {
      formData.append(parentKey ? `${parentKey}[${parentIndex}][${key}]` : key, value || '');
    }
  });

  return formData;
}

export const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

export const convertArrayOfObjectsToCSV = (args) => {
  const data = args.data;
  if (!data || !data.length) return;

  const columnDelimiter = args.columnDelimiter || ',';
  const lineDelimiter = args.lineDelimiter || '\n';

  const keys = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'role_id');

  let result = '';
  result += 'No.' + columnDelimiter + keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach((item, index) => {
    let ctr = 0;
    result += (index + 1) + columnDelimiter;
    keys.forEach(key => {
      if (ctr > 0) result += columnDelimiter;
      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

export const downloadCSV = (downloadData, fileName) => {
  const csv = convertArrayOfObjectsToCSV({
    data: downloadData
  });
  if (!csv) return;
  const filename = fileName;
  if (!csv.match(/^data:text\/csv/i)) {
    const csvData = 'data:text/csv;charset=utf-8,' + csv;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvData));
    link.setAttribute('download', filename);
    link.click();
  }
}

export const isLatestMessage = (message, messagesInGroup) => {
  const { created_at: createdAt, id } = message;

  let latestMessage = null;
  for (const msg of messagesInGroup) {
    const msgCreatedAt = msg.created_at;
    const msgId = msg.id;

    if (!latestMessage || msgCreatedAt > latestMessage.created_at || msgId > latestMessage.id) {
      latestMessage = { created_at: msgCreatedAt, id: msgId };
    }
  }

  if (latestMessage) {
    return createdAt === latestMessage.created_at || id === latestMessage.id;
  }

  return true;
}

export const isEmptyObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return true;
  }
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && obj[key]) {
      return false;
    }
  }
  return true;
};

export const downloadCSVFromData = (downloadData, fileName) => {
  const currentDate = dayjs();
  const formattedDate = currentDate.format('DD.MM.YYYY');
  const updatedFileName = `${fileName}_${formattedDate}.csv`;
  const csvData = convertArrayOfObjectsToCSV({ data: downloadData });
  if (!csvData) return;
  const blob = new Blob([csvData], { type: 'text/csv' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, updatedFileName);
  } else {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = updatedFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadByATag = (url, fileName) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank'
  a.download = fileName; // Set the desired file name
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export const downloadFile = (file, type = LABEL_TYPE.URL, fileName = 'multi-contract') => {
  return new Promise((resolve, reject) => {
    if (type === LABEL_TYPE.URL) {
      fetch(file?.url || '')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const documentName = file.fileName || fileName;
          downloadByATag(url, documentName);
          resolve();
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    } else if (type === LABEL_TYPE.PDF) {
      const byteCharacters = atob(file);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const documentName = file.fileName || fileName;
      downloadByATag(url, documentName);
      resolve();
    }
  });
};

export const parseCSVToDataArray = (csvString) => {
  if (typeof csvString !== 'string') {
    throw new Error('Input is not a valid string.');
  }

  const lines = csvString.split('\n');
  const result = [];
  const headers = lines[0].split(',');

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    if (currentLine.length !== headers.length) {
      continue;
    }

    const rowData = {};
    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = currentLine[j];
    }
    result.push(rowData);
  }

  return result;
};

export const downloadCSVFromCSVString = (csvString, fileName) => {
  const dataArray = parseCSVToDataArray(csvString);
  downloadCSVFromData(dataArray, fileName);
};

export const formatFileSize = (fileSizeInBytes) => {
  if (fileSizeInBytes < 1024 * 1024) {
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
    return fileSizeInKB + ' KB';
  } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    return fileSizeInMB + ' MB';
  } else {
    const fileSizeInGB = (fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2);
    return fileSizeInGB + ' GB';
  }
}

export const formatStringToDate = (dateString) => {
  if (dateString) {
    const dateParts = dateString.split('/');
    const formattedDateString = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    const formattedDate = new Date(formattedDateString);
    return formattedDate;
  }
};

export const formatNumberWithTwoDecimalPlaces = (number) => {
  if (!number || typeof number === 'object') return '0.00';
  const roundedNumber = Math.round(number * 100) / 100;
  return roundedNumber.toFixed(2);
};

export const formatCurrency = (number, locale = 'en-US', currency = 'USD') => {
  if (number === null || number === undefined) return '';
  const formattedNumber = formatNumberWithTwoDecimalPlaces(number);
  return formattedNumber.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const isSimilarObject = (obj1, obj2) => {
  if (!obj1 || !obj2) return;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  return keys1.every(key => {
    const val1 = obj1[key];
    const val2 = obj2[key];
    if (val1 === null || val1 === undefined) {
      return val2 === null || val2 === undefined;
    }
    if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
      return isSimilarObject(val1, val2);
    }
    return val1 === val2;
  });
};

export const formatCustomerName = (name) => {
  if (typeof name !== 'string') {
    name = 'customer';
  }
  const nameWithoutDiacritics = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const formattedName = nameWithoutDiacritics.replace(/\s+/g, '_');
  return formattedName;
};

export const formatPhoneNumber = (inputNumber) => {
  const formattedNumber = inputNumber?.replace(/\D/g, '');
  let formattedPhoneNumber = '';
  for (let i = 0; i < formattedNumber?.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedPhoneNumber += ' ';
    }
    formattedPhoneNumber += formattedNumber[i];
  }
  return formattedPhoneNumber;
};

export const formatDuration = (durationInSeconds) => {
  if (isNaN(durationInSeconds) || durationInSeconds < 0) {
    return '0:00';
  }
  if (durationInSeconds < 60) {
    const seconds = Math.floor(durationInSeconds);
    return `0:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const capitalizeFirstLetter = (str) => {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const extractSecondNameInURL = (path) => {
  const parts = path.split('/');

  if (parts.length > 2) {
    return parts[2];
  }

  return null;
};

export const validatePaymentTerm = (value) => {
  const numericValue = parseFloat(value);
  return isNaN(numericValue) || numericValue < 0 || numericValue > 100;
};

export const validateDescription = (value) => {
  return value.length > 1000;
};

export const formatPriceWithTwoDecimals = (total) => {
  if (!total || typeof total === 'object') return '0.00';
  if (total) {
    const roundedTotal = (+total).toFixed(2);
    const natural = Math.floor(+total)
    const decimal = roundedTotal.split('.')[1];
    return [natural.toLocaleString('es-US'), decimal].join('.');
  }
  return '0.00';
};

export const parseLocaleStringToNumber = (price) => {
  if (!price) return 0.00;
  if (price.toString().includes('.')) {
    const splitPrice = price.toString().split('.')
    // Remove non-numeric characters and replace commas with dots
    const numericString = splitPrice[0].replace(/[^0-9.-]/g, '').replace(',', '.');
    const integerPart = parseFloat(numericString);
    const decimalPart = +(['0', splitPrice[1]].join('.'))
    return isNaN(integerPart) ? 0 : integerPart + decimalPart;
  }
  return price
};

export const handleSetNumber = (number, callback) => {
  if (!callback) return
  if (!isNaN(number)) {
    callback(number)
  }
}
export const disableInputWhenLargerThanTwoDecimals = (number) => {
  if (typeof number !== 'number') return true
  const decimal = number.toString().split('.')[1]
  return decimal?.length > 2
}

export const formatDate = (inputDate) => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(inputDate)) {
    return 'NA';
  }
  const [day, month, year] = inputDate.split('/');
  const formattedDate = dayjs(`${year}-${month}-${day}`).format('DD MMM YYYY');
  return formattedDate;
};

export const formatTime = (dateTimeString) => {
  const parsedDate = dayjs(dateTimeString);
  const formattedTime = parsedDate.format('h:mma'); // 'h' for hour, 'mm' for minute, 'a' for AM/PM
  return formattedTime;
}

export const chartRoundNumber = (number) => {
  if (number % 1000 > 500) {
    return Math.ceil(number / 1000) * 1000;
  } else {
    return Math.floor(number / 1000) * 1000;
  }
}
export const sendEmail = (body) => {
  const mailtoLink = `mailto:?body=${encodeURIComponent(body)}`;
  const link = document.createElement('a');
  link.href = mailtoLink;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const roundToTwoDecimals = (number) => {
  if (!number || typeof number === 'object') return 0.00;
  if (number) {
    return Math.round(+number * 100) / 100;
  }
  return 0.00
}
