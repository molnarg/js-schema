module.exports = {
  referenceHandler : function(referenceArray) {
    return function(reference) {
      var index = referenceArray.indexOf(reference)
      return index !== -1 ? index : '{' + (referenceArray.push(reference) - 1) + '}'
    }
  }
}
