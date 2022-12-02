
const getSiblings = (e) => {
    // for collecting siblings
    let siblings = []; 
    // if no parent, return no sibling
    if(!e.parentNode) {
        return siblings;
    }
    // first child of the parent node
    let sibling  = e.parentNode.firstChild;
    // collecting siblings
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

//https://stackoverflow.com/questions/29255843/is-there-a-way-to-reverse-the-formatting-by-intl-numberformat-in-javascript

const parseLocaleNumber = (stringNumber) => {
    return parseFloat(stringNumber
        .replace(new RegExp('\\' + ".", 'g'), '') //thousandSeparator
        .replace(new RegExp('\\' + ","), '.') //decimalSeparator
    );
}

export {getSiblings,parseLocaleNumber}