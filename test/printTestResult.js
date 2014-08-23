module.exports = function (input, errors){
    input = input || {};
    return [
        "","Input:",JSON.stringify(input, null, 2),
        "","Errors:",JSON.stringify(errors, null,2)
    ].join("\n")
}