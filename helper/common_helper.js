exports.commonFormatResponseToServer = function(response, success_msg, error_msg, data){
    return {
        response: response,
        success_msg: success_msg,
        error_msg: error_msg,
        data: data,
    };
};