function getPropertyVal(object, property, defaultVal) {
    if (object && object.hasOwnProperty(property)) {
        return object[property];
    }
    return defaultVal;
}