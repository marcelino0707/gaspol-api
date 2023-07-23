const ServingType = require("../models/serving_type");

const priceDeterminant = async (price, serving_type_id) => {
    const servingType = await ServingType.getServingTypeById(serving_type_id);
    let result = price + (price * servingType.percent / 100);    
    if(servingType.name == "GoFood") {   
        result = result + 1000
    }
    return result;   
};

module.exports = {
    priceDeterminant,
};