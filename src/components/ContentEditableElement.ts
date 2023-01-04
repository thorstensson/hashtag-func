export class ContentEditableElement {

    userTemplate(message) {
        return `
    <div class='content-editable-element' contenteditable="true" data-text="${message}"></div>
  `;
    }
}


