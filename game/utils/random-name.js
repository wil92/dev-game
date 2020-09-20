/**
 *
 * @param length {number}
 * @returns {string}
 */
export const randomName = function (length) {
    return [ ...new Array(length) ]
        .reduce(p => p + 'qwertyuiasdfghjzxcnmiopjkl'[Math.floor(Math.random() * 20)], '');
};
