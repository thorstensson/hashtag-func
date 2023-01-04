import "./styles.scss";
import Data from "./assets/data.json";
import { ContentEditableElement } from "./components/ContentEditableElement";
import { UnorderedListElement } from "./components/UnorderedListElement";
import { getLastWordTyped } from "./utils/StringUtils";

export class App {

  private listItems;
  private textbox;
  private lookupw;
  private app;
  private contentEdBox;
  private unorderedListEl;

  private tagsJsonArr: string[];
  private typedTags: string[];
  private isHashKeyed = false;
  private lastWordStr: string;

  /**
   * If a hashtag api instead of this local json, then write a service class (axios etc for checking against, this is interesting {@link https://hashtagify.me/manual/api}
   */
  constructor() {
    this.tagsJsonArr = JSON.parse(JSON.stringify(Data));
    this.doSomeDOM()
  }

  /**
   * I'm taking an openclassroom course in atomic design but just separating things out a litle here (really the sass could be partialised, and if library would be perfected then maybe molecules, atoms), interesting read for me was {@link https://blog.alexdevero.com/atomic-design-scalable-modular-css-sass/}
   */
  doSomeDOM() {
    this.app = document.getElementById("app");
    this.contentEdBox = new ContentEditableElement().userTemplate("Write something");
    this.unorderedListEl = new UnorderedListElement().userTemplate();

    this.app.insertAdjacentHTML("beforeend", this.contentEdBox);
    this.app.insertAdjacentHTML("beforeend", this.unorderedListEl);

    this.textbox = document.getElementsByClassName("content-editable-element")[0];
    this.lookupw = document.getElementsByClassName("unordered-list-element")[0];

    this.addListeners();
  }

  addListeners() {
    // Works for content editable except in IE 11...
    this.textbox.addEventListener("keyup", (e) => {
      if (e.key == " " || e.keyCode == 32 || e.code == "Space" || e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
        this.isHashKeyed = false;
        this.hideRelatedTagsList();
      }
      this.checkForHashtags();
      this.lookupTagList();
    });
  }

  /**
   * Check if we have a typed hashtag that sits in JSON list
   */
  lookupTagList() {
    this.lastWordStr = getLastWordTyped();
    let relatedTagsArr = [];

    if (this.lastWordStr == "#") this.isHashKeyed = true;

    // Compare against the JSON list
    if (this.lastWordStr && this.isHashKeyed) {

      for (const word of this.tagsJsonArr) {
        if (word.startsWith(`#${this.lastWordStr}`)) {
          relatedTagsArr.push(word)
        }
      }
      console.log("relatedTagsArr", relatedTagsArr)
    }
    (relatedTagsArr.length == 0) ? this.hideRelatedTagsList() : this.showRelatedTagsInList(relatedTagsArr);
  }

  /**
   * @param arr Show related tags from JSON in an unordered list
   */
  showRelatedTagsInList(arr: string[]) {
    this.lookupw.style.visibility = "visible";
    this.lookupw.firstChild.innerHTML = "";

    let boxStr = this.textbox.innerText;

    for (const tag of arr) {
      this.lookupw.firstChild.innerHTML += "<li><a href='" + tag + "'>" + tag + "</a></li>";
    }

    this.listItems = document.querySelectorAll("ul li");
    this.listItems.forEach((item) => {
      item.addEventListener('click', (e) => {

        // Word boundaries, thanks to heavy coffe, without this each letter that compares, gets replaced
        let rmPiece = this.lastWordStr;
        let removeBoundedStr = `\\b${rmPiece}\\b`;
        const regex = new RegExp(removeBoundedStr, 'g'); // correct way
        let result = boxStr.replaceAll(regex, e.currentTarget.innerText.slice(1))
        this.textbox.innerText = result;

        this.hideRelatedTagsList();
        this.checkForHashtags();
      })
    });
  }

  hideRelatedTagsList() {
    this.lookupw.style.visibility = "hidden";
  }

  /**
   * Check if we have a valid hashtag and if so, then embed it in a span tag and set color
   */
  checkForHashtags() {
    let pattern = /(#\w+)/gm;
    let boxStr = this.textbox.innerText;
    let myTest = pattern.test(boxStr);

    if (myTest) {
      this.typedTags = [...boxStr.match(pattern)];
    }

    //Replace & recolor all tags
    if (this.typedTags) {
      let str;
      for (const tag of this.typedTags) {
        str = boxStr.replaceAll(tag.toLowerCase(), `<span style="color:#1DA1F2">${tag.toLowerCase()}</span>`)
        boxStr = str; // keep the str
      }

      // Get caret position
      let sel = window.getSelection()
      sel.extend(this.textbox, 0)
      let pos = sel.toString().length

      // Update contenteditable div
      this.textbox.innerHTML = this.parse(str)

      // Put caret back
      while (pos-- > 0)
        sel.modify('move', 'forward', "character")
    }
  }

  parse(text) {
    return text
      .replace(/\*\*(.*)\*\*/gm, '**<strong>$1</strong>**')     // bold
      .replace(/\*(.*)\*/gm, '*<em>$1</em>*');                  // italic
  }

}

// Create
const appInstance = new App();
