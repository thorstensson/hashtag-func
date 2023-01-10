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

