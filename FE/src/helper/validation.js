import dayjs from 'dayjs';

import { IMAGE_FILE_MAX_SIZE, MESSAGE, REGEX_EMAIL, REGEX_PASSWORD, REGEX_USERNAME, ROLES, DOCUMENT_FILE_MAX_SIZE, TEXT_MAX_LENGTH, ALLOWED_FILE_FORMATS, CHAT_FILE_MAX_SIZE, INVENTORY, QUOTATION, REGEX_NATURAL_NUMBER, INVOICE_BILL_FIELDS, DISCOUNT, UPLOAD_CSV_EXTENSION, PERMISSION } from 'src/constants/config';
import { normalizeString } from './helper';

export const validateLogin = (values) => {
  const errors = {}

  if (!values.username) {
    errors.username = 'Please fill in your username.'
  } else if (!REGEX_USERNAME.test(values.username)) {
    errors.username = 'Invalid username format.';
  }

  if (!values.password) {
    errors.password = 'Please fill in your password.'
  }

  return errors
}

export const validateEmail = (values) => {
  const errors = {}

  if (!values.email) {
    errors.email = 'Please fill in your email.'
  } else if (!REGEX_EMAIL.test(values.email)) {
    errors.email = 'Invalid email format. Email: example@example.com';
  }

  return errors
}

export const validateTextMaxLength = (field, values) => {
  if (values.length > TEXT_MAX_LENGTH) return `${field} must be less than 255 characters`;
  return '';
}

export const validateResetPassword = (values) => {
  const errors = {};
  if (!values.reset_password_token) {
    errors.message = 'Invalid authorization.'
  }

  if (!values.new_password) {
    errors.new_password = 'Please fill in your new password.';
  } else if (!REGEX_PASSWORD.test(values.new_password)) {
    errors.new_password = 'Invalid password format. Example:"@SaDoa123"';
  }

  if (!values.confirm_password) {
    errors.confirm_password = 'Please confirm your new password.';
  }

  if (values.new_password !== values.confirm_password) {
    errors.message = 'Passwords are not matched. Please try again.'
  }

  return errors;
}

export const validateCreateCustomer = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Please fill in your name.';
  }

  if (!values.email) {
    errors.email = 'Please fill in your email.';
  } else if (!REGEX_EMAIL.test(values.email)) {
    errors.email = 'Invalid email format. Email: example@example.com';
  }

  if (!values.phone_number) {
    errors.phone_number = 'Please fill in your phone number.';
  } else if (values.phone_number?.length < 10 || values.phone_number?.length > 12) {
    errors.phone_number = 'Invalid phone number.';
  }

  if (!values.address_1) {
    errors.address_1 = 'Please fill in your address.';
  }

  if (!values.address_2) {
    errors.address_2 = 'Please fill in your address.';
  }

  if (!values.postal_code) {
    errors.postal_code = 'Please fill in your postal code.';
  }

  return errors;
}

const getRequiredFieldErrorMessage = (field) =>
  field === INVENTORY.LABEL.ITEM ?
    `${INVENTORY.MESSAGE_FILL_IN + ' ' + field.replace(/_/g, ' ')}.` :
    `${INVENTORY.MESSAGE_SELECT + ' ' + field.replace(/_/g, ' ')}.`;

const getWeightRawLengthErrorMessage = (field, value) =>
  value === 0
    ? `${field.replace('_', ' ').capitalize()} must be greater than 0.`
    : `Please ${field === INVENTORY.LABEL.RAW_LENGTH || field === INVENTORY.LABEL.WEIGHT ? 'fill in' : 'select'} ${field.replace(/_/g, ' ')}.`;

const getCoatingFieldErrorMessage = (field) =>
  `${INVENTORY.MESSAGE_FILL_IN} ${field.replace(/_/g, ' ')}.`;

export const validateMaterialItem = (values) => {
  const errors = {};
  const requiredFields = INVENTORY.FIELD.DEFAULT;
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = getRequiredFieldErrorMessage(field);
    }
  });

  if (values.item?.length > 255) {
    errors.item = 'Item must be less than 255 digits.'
  }

  if (values.code?.length > 255) {
    errors.code = 'Item must be less than 255 digits.'
  }

  switch (values.category) {
    case INVENTORY.ALUMINIUM:
      const requiredAluminiumFields = INVENTORY.FIELD.ALUMINIUM;
      requiredAluminiumFields.forEach((field) => {
        if (!values[field]) {
          errors[field] = getWeightRawLengthErrorMessage(field, values[field]);
        }
      });

      if (values.weight > 1000) {
        errors.weight = 'Weight must be less than 1000 kg/m.'
      }

      if (values.raw_girth > 1000) {
        errors.raw_girth = 'Raw girth must be less than 1000 m.'
      }

      if (values.raw_length < INVENTORY.MIN_MATERIAL_LENGTH) {
        errors.raw_length = `Raw length must be greater than ${INVENTORY.MIN_MATERIAL_LENGTH} m.`
      }

      if (values.coating_price_status === INVENTORY.CHECKED) {
        const requiredCoatingFields = INVENTORY.FIELD.COATING;
        requiredCoatingFields.forEach((field) => {
          if (!values[field]) {
            errors[field] = getCoatingFieldErrorMessage(field);
          }
        });
      }
      break;
    case INVENTORY.SERVICES:
      if (!values.service_type) {
        errors.service_type = 'Please select service type.';
      }
      break;
    default:
      break;
  }

  return errors;
};


export const validateCreateUserInfo = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Please fill in name.';
  }

  if (!values.username) {
    errors.username = 'Please fill in username.';
  } else if (!REGEX_USERNAME.test(values.username)) {
    errors.username = 'Invalid username format.';
  }

  if (!values.role_id) {
    errors.role_id = 'Please select role.';
  }

  if (!values.password) {
    errors.password = 'Please fill in password.';
  } else if (!REGEX_PASSWORD.test(values.password)) {
    errors.password = 'Invalid password format. Example:"@SaDoa123"';
  } else if (values.password?.length > 255) {
    errors.password = 'Password length must be less than 255 digits.'
  }

  if (!values.confirm_new_password) {
    errors.confirm_new_password = 'Please confirm your new password.';
  } else if (values.password !== values.confirm_new_password) {
    errors.confirm_new_password = 'Passwords are not matched. Please try again.';
  }

  if (!values.email) {
    errors.email = 'Please fill in your email.';
  } else if (!REGEX_EMAIL.test(values.email)) {
    errors.email = 'Invalid email format. Email:"example@example.com"';
  }

  return errors;
}

export const validateEditUserInfo = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Please fill in name.';
  }

  if (!values.username) {
    errors.username = 'Please fill in username.';
  } else if (!REGEX_USERNAME.test(values.username)) {
    errors.username = 'Invalid username format.';
  }

  if (!values.role_id) {
    errors.role_id = 'Please select role.';
  }

  if (values.password && !REGEX_PASSWORD.test(values.password)) {
    errors.password = 'Invalid password format. Example:"@SaDoa123"';
  } else if (values.password?.length > 255) {
    errors.password = 'Password length must be less than 255 digits.'
  }

  if (values.password && !values.confirm_new_password) {
    errors.confirm_new_password = 'Please confirm your new password.';
  } else if (values.password !== values.confirm_new_password) {
    errors.confirm_new_password = 'Passwords are not matched. Please try again.';
  }

  if (!values.email) {
    errors.email = 'Please fill in your email.';
  } else if (!REGEX_EMAIL.test(values.email)) {
    errors.email = 'Invalid email format. Email:"example@example.com"';
  }

  return errors;
}

export const validateCreateNewRole = (values) => {
  const errors = {};

  const isSetPermission = Object.values(values.role_setting).some((role) => {
    return role.create === 1 || role.update === 1 || role.delete === 1 || role.send === 1;
  });

  if (!values.role_name) {
    errors.role_name = 'Please fill in role name.';
  }

  if (normalizeString(values.role_name) === ROLES.ADMIN) {
    errors.role_name = 'Cannot set Role Name as "Admin". Please try another one.';
  }

  if (!isSetPermission) {
    errors.role_setting = 'Please choose at least one Role Permission.';
  }

  return errors;
}

export const validateEditRole = (values) => {
  const errors = {};

  const isSetPermission = Object.values(values.role_setting).some((role) => {
    return role.create === 1 || role.update === 1 || role.delete === 1 || role.send === 1;
  });

  if (!values.role_name) {
    errors.role_name = 'Please fill in role name.';
  }

  if (normalizeString(values.role_name) === ROLES.ADMIN) {
    errors.role_name = 'Cannot change Role Name to "Admin".';
  }

  if (!isSetPermission) {
    errors.role_setting = 'Please choose at least one Role Permission.';
  }

  return errors;
}

export const validateFilterRequest = (values) => {
  const errors = {};
  const endDate = values.end_date ? dayjs(values.end_date) : null;
  const startDate = values.start_date ? dayjs(values.start_date) : null;

  if (endDate && startDate && startDate.isAfter(endDate)) {
    errors.start_date = 'Start date cannot be after the end date.';
  }

  return errors;
}

export const validateScrapFilterRequest = (values) => {
  const errors = {};
  const endDate = values.end_date ? dayjs(values.end_date) : null;
  const startDate = values.start_date ? dayjs(values.start_date) : null;

  if (endDate && startDate && startDate.isAfter(endDate)) {
    errors.start_date = 'Start date cannot be after the end date.';
  }

  if (values.min_length && values.max_length && (values.min_length > values.max_length)) {
    errors.min_length = 'Min length must smaller than max length.'
  }

  return errors;
}

export const validateRoleDeleteRequest = (values, roleList) => {
  const errors = {};

  const roleWithUsers = roleList?.find(role => values?.role_id?.includes(role.id) && role.number_user > 0);
  const roleIsAdmin = roleList?.find(role => values?.role_id?.includes(role.id) && role.role_name === 'Admin');

  if (roleWithUsers) {
    errors.user = MESSAGE.ERROR.USER_EXIST;
  }

  if (roleIsAdmin) {
    errors.admin = MESSAGE.ERROR.ADMIN_DELETE;
  }

  return errors;
};

export const validateUserDeleteRequest = (values, list, currentUser) => {
  const errors = {};

  const isAdminUser = list?.find(user => values?.user_id?.includes(user.id) && user.role_name === 'Admin');
  const isSelfDelete = values?.user_id?.includes(currentUser.id)

  if (isAdminUser) {
    errors.admin = MESSAGE.ERROR.ADMIN_DELETE;
  }

  if (isSelfDelete) {
    errors.current_user = MESSAGE.ERROR.SELF_DELETE;
  }

  return errors;
};

export const validateSendMessage = (values) => {
  const errors = {};

  if (!values.phone_number) {
    errors.phone_number = 'No found customers phone number.';
  }

  if (!values.type) {
    errors.type = 'Type is required.';
  }

  if (!values.emoji && values.emoji !== '') {
    if (!values?.image_video && !values?.document && !values?.video && !values?.image) {
      if (!values.message) {
        errors.message = 'Message is required.';
      }
    } else {
      if (values?.image_video) {
        const mediaType = values?.image_video?.type.split('/')[0] || '';
        if (mediaType !== 'image' && mediaType !== 'video') {
          errors.message = 'File must be image or video.';
        }
        else {
          if (mediaType === 'image' && values?.image_video?.size > IMAGE_FILE_MAX_SIZE) {
            errors.message = 'Image size must be less than 20Mb.';
          }
          if (mediaType === 'video' && values?.image_video?.size > CHAT_FILE_MAX_SIZE) {
            errors.message = 'Video size must less than 64Mb.';
          }
        }
      } else if (values?.document) {
        if (values?.document?.size > DOCUMENT_FILE_MAX_SIZE) {
          errors.message = 'Document size must be less than 20Mb.';
        }
      } else { }
    }
  }

  return errors;
}

export const validateMessageAction = (values) => {
  const errors = {};

  if (!values.conversation_id) {
    errors.conversation_id = 'No found the selected chat conversation.';
  }

  if (!values.message_id) {
    errors.message_id = 'No found the selected message.';
  }

  return errors;
}

export const validateDeleteMessage = (values) => {
  const errors = {}

  if (!values.conversation_id) {
    errors.conversation_id = 'No found the selected chat conversation.';
  }

  return errors
}

export const validateCreateQuotation = (values) => {
  const errors = {};
  const startDate = values.issue_date ? dayjs(values.issue_date) : null;
  const endDate = values.valid_till ? dayjs(values.valid_till) : null;

  if (!values.reference_no) {
    errors.reference_no = 'Reference No is required.';
  } else if (values.reference_no.length > 255) {
    errors.reference_no = 'Reference No must be less than 255 digits.';
  }

  if (values.is_new_customer) {
    const requiredFields = ['name', 'email', 'phone_number', 'address_1', 'address_2', 'postal_code'];
    requiredFields.forEach(field => {
      if (!values[field]) {
        errors[field] = `Please fill in your ${field.replace('_', ' ')}.`;
      }
    });

    if (values.email && !REGEX_EMAIL.test(values.email)) {
      errors.email = 'Invalid email format. Email: example@example.com';
    }
    if (values.phone_number?.length < 10 || values.phone_number?.length > 12) {
      errors.phone_number = 'Invalid phone number.';
    }
  }

  if (!values.customer_id && !values.is_new_customer) {
    errors.customer_id = 'Customer is required.';
  }

  ['issue_date', 'valid_till'].forEach(field => {
    if (!values[field]) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required.`;
    }
  });

  if (!values.terms_of_payment_confirmation) {
    errors.terms_of_payment_confirmation = 'Terms of Payment is required.';
  } else if (values.terms_of_payment_confirmation > 100) {
    errors.terms_of_payment_confirmation = 'Terms of Payment must less than 100.';
  }

  if (endDate && startDate && startDate.isAfter(endDate)) {
    errors.valid_till = 'Issue Date cannot be after the Valid Till.';
  }

  return errors;
};

export const validateEditQuotation = (values) => {
  const errors = {}
  const startDate = values.issue_date ? dayjs(values.issue_date) : null;
  const endDate = values.valid_till ? dayjs(values.valid_till) : null;

  if (!values.reference_no) {
    errors.reference_no = 'Reference No is required.';
  } else if (values.reference_no?.length >= 255) {
    errors.reference_no = 'The Reference No must less than 255 digits.';
  }

  if (!values.customer_id) {
    errors.customer_id = 'Customer is required.';
  }

  if (!values.quotation_id) {
    errors.quotation_id = 'Not found the Quotation.';
  }

  if (!values.status) {
    errors.status = 'Payment Status is invalid.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Issue Date is required.';
  }

  if (!values.terms_of_payment_confirmation) {
    errors.terms_of_payment_confirmation = 'Terms of Payment is required.';
  } else if (values.terms_of_payment_confirmation > 100) {
    errors.terms_of_payment_confirmation = 'Terms of Payment must less than 100.';
  }

  if (!values.valid_till) {
    errors.valid_till = 'Valid Till is required.';
  } else {
    if (endDate && startDate && startDate.isAfter(endDate)) {
      errors.valid_till = 'Issue Date cannot be after the Valid Till.';
    }
  }

  if (values.description?.length >= 1000) {
    errors.description = 'The Description must less than 1000 digits.';
  }

  return errors
}

export const validateCreateInvoice = (values) => {
  const errors = {}

  if (!values.invoice_no) {
    errors.invoice_no = 'Invoice No is required.';
  }

  if (!values.quotation_id) {
    errors.quotation_id = 'Reference No is required.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select issue date.';
  }

  return errors
}

export const validateUpdateInvoice = (values) => {
  const errors = {}

  const receivedDate = values.payment_received_date ? dayjs(values.payment_received_date) : null;
  const issuedDate = values.issue_date ? dayjs(values.issue_date) : null;

  if (!values.invoice_id) {
    errors.invoice_no = 'No found the invoice id.';
  }

  if (!values.invoice_no) {
    errors.invoice_no = 'Invoice No is required.';
  }

  if (!values.quotation_id) {
    errors.quotation_id = 'Reference No is required.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select issue date.';
  }

  if (receivedDate && issuedDate && issuedDate.isAfter(receivedDate)) {
    errors.issue_date = 'Issue date can not be after the received date.';
    errors.payment_received_date = 'Received date cannot be before the issue date.';
  }
  return errors
}

export const validateUploadDocument = (values) => {
  const errors = {}
  const fileExtension = values.document?.name.split('.').pop().toLowerCase()

  if (!values.customer_id) {
    errors.customer_id = 'No found the customer id.';
  }

  if (!values.quotation_id) {
    errors.quotation_id = 'Please select the reference no.';
  }

  if (!values.document) {
    errors.document = 'Please select a document to upload.';
  } else if (values.document?.size > DOCUMENT_FILE_MAX_SIZE) {
    errors.document = 'Document size must less than 20MB.';
  } else if (!ALLOWED_FILE_FORMATS.includes(fileExtension)) {
    errors.document = 'Only accept type: ' + ALLOWED_FILE_FORMATS.join(', ');
  }

  return errors
}

export const validateCreateProductTemplate = (values) => {
  const errors = {}

  if (!values.item) {
    errors.item = 'Please fill in item.';
  }

  if (!values.profile) {
    errors.profile = 'Please select profile.';
  }

  if (values.create?.length === 0) {
    errors.create = 'Please select item.';
  }

  return errors
}

export const validateUpdateProductTemplate = (values) => {
  const errors = {}

  if (!values.item) {
    errors.item = 'Please fill in item.';
  }

  if (!values.profile) {
    errors.profile = 'Please select profile.';
  }

  if (values.product_template_material?.length === 0) {
    errors.create = 'Please select item.';
  }

  return errors
}

export const validateHandleNoteChange = (values) => {
  const errors = [];
  if (values.create && Array.isArray(values.create)) {
    values.create.forEach(item => {
      const itemErrors = validateNoteItem(item, item.id);
      errors.push(...itemErrors);
    });
  }
  if (values.update && Array.isArray(values.update)) {
    values.update.forEach(item => {
      const itemErrors = validateNoteItem(item, item.id);
      errors.push(...itemErrors);
    });
  }
  return errors;
};

const validateNoteItem = (item, itemId) => {
  const itemErrors = [];
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];
      if (value === null || value === undefined || value === '') {
        itemErrors.push({
          id: itemId,
          message: `The ${key} can not be empty.`,
        });
      } else if (value.length >= 255) {
        itemErrors.push({
          id: itemId,
          message: `The ${key} must be less than 255 digits.`,
        });
      }
    }
  }

  return itemErrors;
};

export const validateHandleTermChange = (values) => {
  const errors = [];
  if (values.create && Array.isArray(values.create)) {
    values.create.forEach(item => {
      const itemErrors = validateTermItem(item, item.id);
      errors.push(...itemErrors);
    });
  }
  if (values.update && Array.isArray(values.update)) {
    values.update.forEach(item => {
      const itemErrors = validateTermItem(item, item.id);
      errors.push(...itemErrors);
    });
  }
  return errors;
};

const validateTermItem = (item, itemId) => {
  const itemErrors = [];
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];
      if (value === null || value === undefined || value === '') {
        itemErrors.push({
          id: itemId,
          message: `The ${key} can not be empty.`,
        });
      } else if (value.length >= 1000) {
        itemErrors.push({
          id: itemId,
          message: `The ${key} must be less than 1000 digits.`,
        });
      }
    }
  }

  return itemErrors;
};

export const validateCreateQuotationSection = (values) => {
  const errors = [];
  if (!values.quotation_id) {
    errors.quotation_id = 'No found the quotation id.';
  }

  if (!values.section_name) {
    errors.section_name = 'Please fill in section name.';
  } else if (values.section_name.length > 255) {
    errors.section_name = 'Section name must be less than 255 digits.';
  }

  return errors;
};

export const validateCreateSectionProduct = (values) => {
  const errors = {};
  const requiredFields = QUOTATION.PRODUCT_FIELD.INPUT;

  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = `Please fill in ${field.replace('_', ' ')}.`;
    }
  });

  const requiredSelectFields = QUOTATION.PRODUCT_FIELD.SELECT;
  requiredSelectFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = `Please select ${field.replace('_', ' ')}.`;
    }
  });

  const maxLengthFields = QUOTATION.PRODUCT_FIELD.INPUT;
  maxLengthFields.forEach((field) => {
    if (values[field] && values[field].length > 255) {
      errors[field] = `The ${field.replace('_', ' ')} must be less than 255 digits.`;
    }
  });

  if (!values.storey_text) {
    errors.storey_text = 'Please fill in storey.'
  } else if (values.storey_text?.length > 255) {
    errors.storey_text = 'The storey must be less than 255 digits.'
  }

  if (!values.area_text) {
    errors.area_text = 'Please fill in area.'
  } else if (values.area_text?.length > 255) {
    errors.area_text = 'The area must be less than 255 digits.'
  }

  return errors;
};

export const validateCreateProductMaterial = (values) => {
  const errors = {};

  if (!values.quotation_section_id) {
    errors.quotation_section_id = 'No found the section.';
  }

  if (!values.type) {
    errors.type = 'No found the material type.';
  }

  if (!values.product_id) {
    errors.product_id = 'No found the product.';
  }

  if (!values.order_number) {
    errors.order_number = 'Invalid the product order number.';
  }

  if (!values.title) {
    errors.title = 'Please fill in product title.';
  } else if (values.title.length > 255) {
    errors.title = 'Title must less than 255 digits.';
  }

  return errors;
};

export const validateEditProductMaterial = (values) => {
  const errors = {};

  if (!values.type) {
    errors.type = 'No found the material type.';
  }

  if (!values.product_id) {
    errors.product_id = 'No found the product.';
  }

  if (!values.order_number) {
    errors.order_number = 'Invalid the product order number.';
  }

  if (!values.title) {
    errors.title = 'Please fill in product title.';
  } else if (values.title.length > 255) {
    errors.title = 'Title must less than 255 digits.';
  }

  return errors;
};

export const validateCreateGlassMaterial = (values) => {
  const errors = {};

  if (!values.quotation_section_id) {
    errors.quotation_section_id = 'No found the section.';
  }

  if (!values.type) {
    errors.type = 'No found the material type.';
  }

  if (!values.product_id) {
    errors.product_id = 'No found the product.';
  }

  if (!values.order_number) {
    errors.order_number = 'Invalid the order number';
  }

  if (!values.no_of_panels) {
    errors.panel = 'Please fill in the number of panels.';
  } else if (values.no_of_panels <= 0 || !REGEX_NATURAL_NUMBER.test(values.no_of_panels.toString())) {
    errors.panel = 'Invalid number.';
  }

  if (!values.material_id) {
    errors.glass_item = 'Please select a glass item.';
  }

  if (values.min_size > values.quantity) {
    errors.glass_item = `This item's min size is ${values.min_size} m².`;
  }

  if (!values.unit_price) {
    errors.unit_price = 'Please fill in unit price.';
  }

  if (!values.title) {
    errors.title = 'Please fill in glass title.';
  } else if (values.title.length > 255) {
    errors.title = 'Glass title must less than 255 digits.';
  }

  return errors;
};

export const validateEditGlassMaterial = (values) => {
  const errors = {};

  if (!values.type) {
    errors.message = 'No found the material type.';
  }

  if (!values.quotation_id) {
    errors.message = 'No found the quotation.';
  }

  if (!values.product_id) {
    errors.message = 'No found the product.';
  }

  if (!values.product_item_id) {
    errors.message = 'No found the product.';
  }

  if (!values.order_number) {
    errors.order_number = 'Invalid the order number';
  }

  if (!values.no_of_panels) {
    errors.panel = 'Please fill in the number of panels.';
  } else if (values.no_of_panels <= 0 || !REGEX_NATURAL_NUMBER.test(values.no_of_panels.toString())) {
    errors.panel = 'Invalid number.';
  }

  if (!values.material_id) {
    errors.glass_item = 'Please select a glass item.';
  }

  if (values.min_size > values.quantity) {
    errors.glass_item = `This item's min size is ${values.min_size} m².`;
  }

  if (!values.unit_price) {
    errors.unit_price = 'Please fill in unit price.';
  }

  if (!values.title) {
    errors.title = 'Please fill in glass title.';
  } else if (values.title.length > 255) {
    errors.title = 'Glass title must less than 255 digits.';
  }

  return errors;
};

export const validateCreateExtraOrderMaterial = (values) => {
  const errors = {};

  if (!values.quotation_section_id) {
    errors.quotation_section_id = 'No found the section.';
  }

  if (!values.type) {
    errors.type = 'No found the material type.';
  }

  if (!values.product_id) {
    errors.product_id = 'No found the product.';
  }

  if (!values.order_number) {
    errors.order_number = 'Invalid the order number';
  }

  if (!values.material_id) {
    errors.material_id = 'Please select a service item.';
  }

  if (!values.service_type) {
    errors.service_type = 'Please select a service type.';
  }

  if (!values.quantity) {
    errors.quantity = 'Please fill in quantity.';
  }

  if (!values.unit_price) {
    errors.unit_price = 'Please fill in unit price.';
  }

  if (!values.title) {
    errors.title = 'Please fill in glass title.';
  } else if (values.title.length > 255) {
    errors.title = 'Glass title must less than 255 digits.';
  }

  return errors;
};
export const validateEditExtraOrderMaterial = (values) => {
  const errors = {};

  if (!values.type) {
    errors.type = 'No found the material type.';
  }

  if (!values.quotation_id) {
    errors.message = 'No found the quotation.';
  }

  if (!values.product_id) {
    errors.message = 'No found the product.';
  }

  if (!values.product_item_id) {
    errors.message = 'No found the product.';
  }

  if (!values.order_number) {
    errors.order_number = 'Invalid the order number';
  }

  if (!values.material_id) {
    errors.material_id = 'Please select a service item.';
  }

  if (!values.service_type) {
    errors.service_type = 'Please select a service type.';
  }

  if (!values.quantity) {
    errors.quantity = 'Please fill in quantity.';
  }

  if (!values.unit_price) {
    errors.unit_price = 'Please fill in unit price.';
  }

  if (!values.title) {
    errors.title = 'Please fill in glass title.';
  } else if (values.title.length > 255) {
    errors.title = 'Glass title must less than 255 digits.';
  }

  return errors;
};

export const validateSelectItem = (values) => {
  const errors = {};
  if (!values.quotationId) {
    errors.message = 'No found the quotation ID.';
  }
  if (!values.productTemplateId) {
    errors.message = 'No found the product template ID.';
  }
  if (!values.productItemId) {
    errors.message = 'No found the selected material ID.';
  }
  if (!values.productWidth) {
    errors.message = 'No found the product width info.';
  }
  if (!values.productHeight) {
    errors.message = 'No found the product height info.';
  }
  if (!values.selectedItem) {
    errors.material_id = 'No found the selected item.';
  }
  return errors;
};

export const validateAddAluminiumItem = (values) => {
  const errors = {};

  if (!values.width_quantity) {
    errors.width_quantity = 'Please fill in width quantity.';
  }
  if (!values.height_quantity) {
    errors.height_quantity = 'Please fill in height quantity.';
  }
  if (!values.cost_of_raw_aluminium) {
    errors.cost_of_raw_aluminium = 'Please fill in cost of raw aluminium.';
  }
  if (!values.cost_of_powder_coating && values.hasCoating) {
    errors.cost_of_powder_coating = 'Please fill in cost of powder coating.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  return errors;
};

export const validateEditAluminiumItem = (values) => {
  const errors = {};

  if (!values.width_quantity) {
    errors.width_quantity = 'Please fill in width quantity.';
  }
  if (!values.height_quantity) {
    errors.height_quantity = 'Please fill in height quantity.';
  }
  if (!values.cost_of_raw_aluminium) {
    errors.cost_of_raw_aluminium = 'Please fill in cost of raw aluminium.';
  }
  if (!values.cost_of_powder_coating && values.hasCoating) {
    errors.cost_of_powder_coating = 'Please fill in cost of powder coating.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  if (values.product_template_material_id === null || values.product_template_material_id === undefined || values.product_template_material_id === '') {
    errors.message = 'No found the product template material id.';
  }
  if (values.product_item_template_id === null) {
    errors.message = 'No found the product item template id.';
  }
  return errors;
};

export const validateAddSquareMeterItem = (values) => {
  const errors = {};

  if (!values.width) {
    errors.width = 'No found the product width.';
  }
  if (!values.height) {
    errors.height = 'No found the product height.';
  }
  if (!values.cost_of_item) {
    errors.cost_of_item = 'Please fill in cost of item.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }

  return errors;
};

export const validateEditSquareMeterItem = (values) => {
  const errors = {};

  if (!values.width) {
    errors.width = 'No found the product width.';
  }
  if (!values.height) {
    errors.height = 'No found the product height.';
  }
  if (!values.cost_of_item) {
    errors.cost_of_item = 'Please fill in cost of item.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  if (values.product_template_material_id === null || values.product_template_material_id === undefined || values.product_template_material_id === '') {
    errors.message = 'No found the product template material id.';
  }
  if (values.product_item_template_id === null || values.product_item_template_id === undefined || values.product_item_template_id === '') {
    errors.message = 'No found the product item template id.';
  }

  return errors;
};

export const validateAddPieceItem = (values) => {
  const errors = {};
  if (!values.cost_of_item) {
    errors.cost_of_item = 'Please fill in cost of item.';
  }
  if (!values.quantity) {
    errors.quantity = 'Please fill in quantity.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  return errors;
};

export const validateEditPieceItem = (values) => {
  const errors = {};
  if (!values.cost_of_item) {
    errors.cost_of_item = 'Please fill in cost of item.';
  }
  if (!values.quantity) {
    errors.quantity = 'Please fill in quantity.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  if (values.product_template_material_id === null || values.product_template_material_id === undefined || values.product_template_material_id === '') {
    errors.message = 'No found the product template material id.';
  }
  if (values.product_item_template_id === null || values.product_item_template_id === undefined || values.product_item_template_id === '') {
    errors.message = 'No found the product item template id.';
  }

  return errors;
};

export const validateAddMeterItem = (values) => {
  const errors = {};
  if (!values.cost_of_item) {
    errors.cost_of_item = 'Please fill in cost of item.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  return errors;
};

export const validateEditMeterItem = (values) => {
  const errors = {};
  if (!values.cost_of_item) {
    errors.cost_of_item = 'Please fill in cost of item.';
  }
  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }
  if (!values.material_id) {
    errors.message = 'No found the material id.';
  }
  if (values.product_template_id === null || values.product_template_id === undefined || values.product_template_id === '') {
    errors.message = 'No found the product template id.';
  }
  if (!values.product_item_id) {
    errors.message = 'No found the product item id.';
  }
  if (values.product_template_material_id === null || values.product_template_material_id === undefined || values.product_template_material_id === '') {
    errors.message = 'No found the product template material id.';
  }
  if (values.product_item_template_id === null || values.product_item_template_id === undefined || values.product_item_template_id === '') {
    errors.message = 'No found the product item template id.';
  }

  return errors;
};
export const validateHandleInvoiceBillChange = (values) => {
  const errors = [];
  if (values && Array.isArray(values)) {
    values.forEach((item, index) => {
      const itemErrors = validateInvoiceBillData(item, index);
      errors.push(...itemErrors);
    });
  }
  return errors;
};
export const validateInvoiceBillData = (data, index) => {
  const itemErrors = [];
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value === null || value === undefined || value === '') {
        itemErrors.push({
          index: index,
          message: `The ${INVOICE_BILL_FIELDS[key]} can not be empty.`,
        });
      } else if (value.length >= 255) {
        itemErrors.push({
          index: index,
          message: `The ${INVOICE_BILL_FIELDS[key]} must be less than 255 digits.`,
        });
      }
    }
  }
  return itemErrors
}

export const validateCreateClaim = (values) => {
  const errors = {}

  if (!values.claim_no) {
    errors.claim_no = 'Please fill in claim no.';
  } else if (values.claim_no.length > 255) {
    errors.claim_no = 'Claim no must less than 255 digits.';
  }

  if (!values.quotation_id) {
    errors.reference_no = 'Please select a reference no.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select an issue date.';
  }

  return errors
}

export const validateCreateClaimCopy = (values) => {
  const errors = {}

  if (!values.claim_no) {
    errors.claim_no = 'Please fill in claim no.';
  } else if (values.claim_no.length > 255) {
    errors.claim_no = 'Claim no must less than 255 digits.';
  }

  if (!values.quotation_id) {
    errors.reference_no = 'No found the previous reference no.';
  }

  if (!values.previous_claim_no) {
    errors.previous_claim_no = 'No found the previous claim no.';
  }

  if (!values.claim_id) {
    errors.previous_claim_no = 'No found the previous claim no.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select an issue date.';
  }

  return errors
}

export const validateUpdateClaim = (values) => {
  const errors = {}

  if (!values.claim_id) {
    errors.message = 'No found the claim id.';
  }

  if (values.accumulative_from_claim === undefined) {
    errors.message = 'Invalid accumulative amount.';
  }

  if (values.subtotal_from_claim === undefined) {
    errors.message = 'Invalid subtotal amount.';
  }

  if (!values.claim_progress_id) {
    errors.message = 'No found the claim progress id.';
  }

  if (!values.claim_number) {
    errors.claim_number = 'Please fill in claim number.';
  } else if (values.claim_number.length > 255) {
    errors.claim_number = 'Claim number must less than 255 digits.';
  }

  return errors
}

export const validateUpdateClaimDetail = (values) => {
  const errors = {}
  const receivedDate = values.payment_received_date ? dayjs(values.payment_received_date) : null;
  const issuedDate = values.issue_date ? dayjs(values.issue_date) : null;

  if (!values.claim_id) {
    errors.message = 'No found the claim id.';
  }

  if (!values.claim_no) {
    errors.claim_no = 'Please fill in claim no.';
  }

  if (!values.quotation_id) {
    errors.message = 'No found the quotation id.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select issue date.';
  }

  if (receivedDate && issuedDate && issuedDate.isAfter(receivedDate)) {
    errors.issue_date = 'Issue date can not be after the received date.';
    errors.payment_received_date = 'Received date cannot be before the issue date.';
  }

  if (values.payment_received_date && !values.actual_paid_amount) {
    errors.actual_paid_amount = 'Please fill in received amount.';
  }

  if (values.actual_paid_amount && !values.payment_received_date) {
    errors.payment_received_date = 'Please select received date.';
  }

  return errors
}

export const validateCreateVendor = (values) => {
  const errors = {};

  if (!values.vendor_name) {
    errors.vendor_name = 'Please fill in vendor name.';
  }

  if (!values.email) {
    errors.email = 'Please fill in email.';
  } else if (!REGEX_EMAIL.test(values.email)) {
    errors.email = 'Invalid email format. Email: example@example.com';
  }

  if (!values.phone) {
    errors.phone = 'Please fill in phone number.';
  } else if (values.phone?.length < 10 || values.phone?.length > 12) {
    errors.phone = 'Invalid phone number.';
  }
  if (!values.address_1) {
    errors.address_1 = 'Please fill in address 1.';
  } else if (values.address_1?.length > 255) {
    errors.address_1 = 'Address 1 must be less than 255 digits.';
  }

  if (!values.address_2) {
    errors.address_2 = 'Please fill in address 2.';
  } else if (values.address_2?.length > 255) {
    errors.address_2 = 'Address 2 must be less than 255 digits.';
  }

  if (!values.postal_code) {
    errors.postal_code = 'Please fill in postal code.';
  } else if (values.postal_code?.length > 255) {
    errors.postal_code = 'Postal code must be less than 255 digits.';
  }

  if (values.company_name && values.company_name?.length > 255) {
    errors.company_name = 'Company name must be less than 255 digits.';
  }

  return errors;
}

export const validateUpdateVendor = (values) => {
  const errors = {};

  if (!values.vendor_id) {
    errors.message = 'No found vendor id.';
  }

  if (!values.vendor_name) {
    errors.vendor_name = 'Please fill in vendor name.';
  }

  if (!values.email) {
    errors.email = 'Please fill in email.';
  } else if (!REGEX_EMAIL.test(values.email)) {
    errors.email = 'Invalid email format. Email: example@example.com';
  }

  if (!values.phone) {
    errors.phone_number = 'Please fill in phone number.';
  } else if (values.phone?.length < 10 || values.phone?.length > 12) {
    errors.phone_number = 'Invalid phone number.';
  }
  if (!values.address_1) {
    errors.address_1 = 'Please fill in address 1.';
  } else if (values.address_1?.length > 255) {
    errors.address_1 = 'Address 1 must be less than 255 digits.';
  }

  if (!values.address_2) {
    errors.address_2 = 'Please fill in address 2.';
  } else if (values.address_2?.length > 255) {
    errors.address_2 = 'Address 2 must be less than 255 digits.';
  }

  if (!values.postal_code) {
    errors.postal_code = 'Please fill in postal code.';
  } else if (values.postal_code?.length > 255) {
    errors.postal_code = 'Postal code must be less than 255 digits.';
  }

  if (values.company_name && values.company_name?.length > 255) {
    errors.company_name = 'Company name must be less than 255 digits.';
  }

  return errors;
}

export const validateUpdateTax = (values) => {
  const errors = {};

  if (!values.gst_rates) {
    errors.gst_rates = 'Please fill in rate.';
  } else if (values.gst_rates > 100) {
    errors.gst_rates = 'Rate must be less than 100%';
  }

  return errors;
}

export const validateCreatePurchaseOrder = (values) => {
  const errors = {};

  if (!values.vendor_id) {
    errors.vendor_id = 'No found vendor id.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select issue date.';
  }

  if (!values.purchase_order_no) {
    errors.purchase_order_no = 'Please fill in purchase order no.';
  } else if (values.purchase_order_no?.length > 255) {
    errors.purchase_order_no = 'Purchase order no must be less than 255 digits.';
  }


  return errors;
}

export const validatePurchaseUpdateShipping = (values) => {
  const errors = {};

  if (!values.purchase_order_id) {
    errors.purchase_order_id = 'No found purchase order id.';
  }

  if (!values.shipping_fee && values.shipping_fee !== 0) {
    errors.shipping_fee = 'Please fill in shipping fee.';
  }

  return errors;
}

export const validatePurchaseUpdateDiscount = (values) => {
  const errors = {};

  if (!values.purchase_order_id) {
    errors.purchase_order_id = 'No found purchase order id.';
  }

  if ((values.discount_type === DISCOUNT.TYPE.PERCENT) && !values.discount_percent && values.discount_percent !== 0) {
    errors.discount_percent = 'Please fill in discount percent.';
  }

  if ((values.discount_type === DISCOUNT.TYPE.AMOUNT) && !values.discount_amount && values.discount_amount !== 0) {
    errors.discount_amount = 'Please fill in discount amount.';
  }

  return errors;
}

export const validatePurchaseUpdateTax = (values) => {
  const errors = {};

  if (!values.purchase_order_id) {
    errors.purchase_order_id = 'No found purchase order id.';
  }

  if (!values.tax) {
    errors.tax = 'Please fill in rate.';
  }

  return errors;
}

export const validateUpdatePurchaseOrder = (values) => {
  const errors = {};

  if (!values.purchase_order_id) {
    errors.purchase_order_id = 'No found purchase order id.';
  }

  if (!values.purchase_order_no) {
    errors.purchase_order_no = 'Please fill in purchase order no.';
  } else if (values.purchase_order_no?.length > 255) {
    errors.purchase_order_no = 'Purchase order no must less than 255 digits.';
  }

  if (!values.issue_date) {
    errors.issue_date = 'Please select issue date';
  }

  return errors;
}

export const validateRejectQuotation = (values) => {
  const errors = {};

  if (!values.reject_reason) {
    errors.reject_reason = 'Please fill in reject reason.';
  } else if (values.reject_reason?.length > 50) {
    errors.reject_reason = 'Reject reason must less than 50 digits.';
  }

  return errors;
}

export const validateUploadCSV = (values) => {
  const errors = {}
  const fileExtension = values.file?.name.split('.').pop().toLowerCase()

  if (!values.file) {
    errors.file = 'Please select a csv file to upload.';
  } else if (values.file?.size > DOCUMENT_FILE_MAX_SIZE) {
    errors.file = 'File size must less than 20MB.';
  } else if (!UPLOAD_CSV_EXTENSION.includes(fileExtension)) {
    errors.file = 'Only accept type: ' + UPLOAD_CSV_EXTENSION.join(', ');
  }

  return errors
}

export const validatePermission = (permissionData = [], keyCode = '', action = '') => {
  if (permissionData.length === 0 || !keyCode || !action) {
    return false;
  }

  const modulePermission = permissionData.find(permission => permission.hasOwnProperty(keyCode));

  if (!modulePermission) {
    return false;
  }

  const moduleActions = modulePermission[keyCode];

  return moduleActions.hasOwnProperty(action) && moduleActions[action] === PERMISSION.ALLOW_VALUE;
};
