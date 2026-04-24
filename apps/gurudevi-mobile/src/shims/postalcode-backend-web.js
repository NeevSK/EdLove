/**
 * Shim for srilankan-postalcode-backend for Web
 * 
 * Provides basic validation logic without Node.js fs/path dependencies.
 */

const validate = (code) => {
    if (!code || typeof code !== 'string') return false;
    // Basic Sri Lankan postal code validation: 5 digits
    return /^\d{5}$/.test(code);
};

const getCode = (district, city) => {
    return null;
};

const getAllCities = () => {
    return [];
};

const citiesByDistrict = (district) => {
    return [];
};

export {
    validate,
    getCode,
    getAllCities,
    citiesByDistrict,
};

const _default = {
    validate,
    getCode,
    getAllCities,
    citiesByDistrict,
};

export default _default;
