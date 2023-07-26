
function priceDeterminant (price, servingTypeName, servingTypePercent) {
    let result = price + (price * servingTypePercent / 100);    
    if(servingTypeName == "GoFood") {   
        result = result + 1000
    }
    return result;   
};

module.exports = {
    priceDeterminant,
};