function getStatusCode(err) {
  switch (err.code) {
    case "ERR_ASSERTION":
      return 500;
    case "ERR_CHILD_PROCESS_IPC_REQUIRED":
      return 500;
    case "ERR_MODULE_NOT_FOUND":
      return 404;
    case "ERR_SOCKET_CLOSED":
      return 500;
    case "ERR_SYNTAX_ERROR":
      return 500;

    // HTTP errors
    case "ECONNREFUSED":
      return 503;
    case "EHOSTUNREACH":
      return 503;
    case "EPIPE":
      return 500;
    case "ETIMEDOUT":
      return 504;

    // Other errors
    case "ENOENT":
      return 404;
    case "EPERM":
      return 403;

    // New errors
    case "ERR_INVALID_ARG_TYPE":
      return 400;
    case "ERR_INVALID_CALLBACK":
      return 400;
    case "ERR_INVALID_HTTP_MESSAGE":
      return 400;
    case "ERR_INVALID_JSON_STRING":
      return 400;
    case "ERR_INVALID_URL":
      return 400;
    case "ERR_MISSING_ARGS":
      return 400;
    case "ERR_OUT_OF_RANGE":
      return 400;
    case "ERR_TIMEOUT":
      return 408;
    case "ERR_UNHANDLED_REJECTION":
      return 500;
    default:
      return 500;
  }
}
module.exports = { getStatusCode };
