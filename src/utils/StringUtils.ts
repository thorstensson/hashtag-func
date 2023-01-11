export const getLastWordTyped = (): string => {
    var sel, word = "";
    if (window.getSelection && (sel = window.getSelection()).modify && sel.rangeCount > 0) {
        var selectedRange = sel.getRangeAt(0);
        sel.collapseToStart();
        sel.modify("move", "backward", "word");
        sel.modify("extend", "forward", "word");
        word = sel.toString();
        // Restore selection
        sel.removeAllRanges();
        sel.addRange(selectedRange);
    } else if ((sel = document.getSelection) && sel.type != "Control") {
        var range = sel.createRange();
        range.collapse(true);
        range.expand("word");
        word = range.text;
    }
    return word;
};

export const placeCaretAtEnd = (el) => {
    let documentBody = <any>document.body;
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        // IE
    } else if (typeof documentBody.createTextRange != "undefined") {
        var textRange = documentBody.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

