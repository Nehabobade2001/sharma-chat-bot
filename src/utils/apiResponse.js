exports.successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

exports.errorResponse = (message, error = null) => ({
  success: false,
  message,
  error
});
