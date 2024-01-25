import { useState, useEffect } from 'react';

const useForm = (callback, validate, initValue = null) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (initValue) {
      setValues(initValue);
    }
  }, [initValue]);
  useEffect(() => {
    const condition = Object.values(errors).some((item) => {
      return item !== ''
    });
    if (!condition && isSubmitting) {
      callback();
    }
  }, [errors, isSubmitting]);
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validate) {
      setErrors(validate(values));
    }
    setIsSubmitting(true);
  };
  const handleChange = (e, name, value) => {
    if (name || !e.target.name) {
      setValues(values => ({ ...values, [name]: value ? value : e }));
    } else {
      e.persist();
      setValues(values => ({ ...values, [e.target.name]: e.target.value }));
    }
  };

  return {
    handleChange,
    handleSubmit,
    setIsSubmitting,
    values,
    errors,
    isSubmitting,
  }
};

export default useForm;
