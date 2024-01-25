import dayjs from 'dayjs';

import { IMAGE_FILE_MAX_SIZE, MESSAGE, REGEX_EMAIL, REGEX_PASSWORD, REGEX_USERNAME, ROLES, DOCUMENT_FILE_MAX_SIZE, TEXT_MAX_LENGTH, ALLOWED_FILE_FORMATS, CHAT_FILE_MAX_SIZE, INVENTORY, REGEX_SPECIAL_CHARACTERS, QUOTATION, REGEX_NATURAL_NUMBER } from 'src/constants/config';
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
    errors.reset_password_token = 'Invalid authorization.'
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

      if (values.coating_price_status === 1) {
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

  if (values.password?.length > 0 && !REGEX_PASSWORD.test(values.password)) {
    errors.password = 'Invalid password format. Example:"@SaDoa123"';
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
    return role.create === 1 || role.update === 1 || role.delete === 1;
  });

  if (!values.role_name) {
    errors.role_name = 'Please fill in role name.';
  }

  if (normalizeString(values.role_name) === ROLES.ADMIN) {
    errors.role_name = 'Cannot set role Name as "Admin". Please try another one.';
  }

  if (!isSetPermission) {
    errors.role_setting = 'Please choose at least one Role Permission.';
  }

  return errors;
}

export const validateEditRole = (values) => {
  const errors = {};

  const isSetPermission = Object.values(values.role_setting).some((role) => {
    return role.create === 1 || role.update === 1 || role.delete === 1;
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
    const requiredFields = ['name', 'email', 'phone_number', 'address_1', 'postal_code'];
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

  } else if (!values.customer_id) {
    errors.customer_id = 'Customer is required.';
  }

  ['terms_of_payment_confirmation', 'issue_date', 'valid_till'].forEach(field => {
    if (!values[field]) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required.`;
    }
  });

  if (values.terms_of_payment_confirmation > 100) {
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

  if (!values.payment_status) {
    errors.payment_status = 'Payment Status is invalid.';
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

  if (values.description?.length >= 255) {
    errors.description = 'The Description must less than 255 digits.';
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

  if (!values.customer_id) {
    errors.customer_id = 'No found the customer.';
  }

  return errors
}

export const validateUpdateInvoice = (values) => {
  const errors = {}

  if (!values.invoice_id) {
    errors.invoice_no = 'No found the invoice id.';
  }

  if (!values.invoice_no) {
    errors.invoice_no = 'Invoice No is required.';
  }

  if (!values.quotation_id) {
    errors.quotation_id = 'Reference No is required.';
  }

  if (!values.customer_id) {
    errors.customer_id = 'No found the customer.';
  }

  return errors
}

export const validateUploadDocument = (values) => {
  const errors = {}
  const fileExtension = values.document?.name.split('.').pop().toLowerCase()

  if (!values.customer_id) {
    errors.customer_id = 'No found the customer id.';
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

  const specialCharacterFields = QUOTATION.PRODUCT_FIELD.INPUT;
  specialCharacterFields.forEach((field) => {
    if (values[field] && !REGEX_SPECIAL_CHARACTERS.test(values[field])) {
      errors[field] = `The ${field.replace('_', ' ')} invalid format.`;
    }
  });

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

  if (!values.product_template_id) {
    errors.product_template_id = 'Please select a product template.';
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
