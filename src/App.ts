import "./styles.scss";
import Data from "./assets/data.json";
import { ContentEditableElement } from "./components/ContentEditableElement";
import { UnorderedListElement } from "./components/UnorderedListElement";
import { getLastWordTyped, placeCaretAtEnd } from "./utils/StringUtils";

export class App {

  private app;
  private listItems;
  private textbox;
  private lookupbox;
  private contentEdBox;
  private unorderedListEl;

  private isHashKeyed: boolean = false;

  private tagsJsonArr: string[];
  private typedTags: string[];
  private lastWordStr: string;

  /*
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
    this.lookupbox = document.getElementsByClassName("unordered-list-element")[0];

    this.addListeners();
  }

  addListeners() {
    // Works for content editable except in IE 11...
    this.textbox.addEventListener("keyup", (e) => {
      if (e.key == " " || e.keyCode == 32 || e.code == "Space" || e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
        this.hideRelatedTagsList();
        // if we hit spacebar we left word behind so set this flag to false, but what if we hit spacebar, ten move back in string and type?
        this.isHashKeyed = false;
      }
      // if we hit spacebar we dont want to hold on tag list
      if (e.key !== " " || e.keyCode !== 32 || e.code !== "Space") this.lookupTagList();
      // check for hashtags
      this.checkForHashtags();
    });
  }

  /**
   * Check if we have a typed hashtag that sits in JSON list
   */
  lookupTagList() {
    this.lastWordStr = getLastWordTyped().trim();
    let relatedTagsArr = [];
    let boxStr = this.textbox.innerText;

    // # is not part of a word, i cannot at moment see a string way to do it so i use a boolean because if you type #test last word is test but you can have many test in the string, so no indicator of which word is last
    if (this.lastWordStr == "#") this.isHashKeyed = true;

    if (this.isHashKeyed) {
      for (const word of this.tagsJsonArr) {
        // console.log("compare", word, "with", `#${this.lastWordStr}`)
        if (word.trim().startsWith(`#${this.lastWordStr}`)) {
          relatedTagsArr.push(word)
        }
      }
    }

    (relatedTagsArr.length == 0) ? this.hideRelatedTagsList() : this.showRelatedTagList(relatedTagsArr);
  }

  /**
   * @param arr Show related tags from JSON in an unordered list
   */
  showRelatedTagList(arr: string[]) {
    this.lookupbox.style.visibility = "visible";
    this.lookupbox.firstChild.innerHTML = "";
    let boxStr = this.textbox.innerText;

    for (const tag of arr) {
      this.lookupbox.firstChild.innerHTML += "<li><a href='" + tag + "'>" + tag + "</a></li>";
    }

    this.listItems = document.querySelectorAll("ul li");

    this.listItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        // Word boundaries, thanks to heavy coffe, without this each letter that compares, gets replaced
        let rmPiece = this.lastWordStr;
        let removeBoundedStr = `\\b${rmPiece}\\b`;
        const regex = new RegExp(removeBoundedStr, 'g'); // correct way
        let result = boxStr.replaceAll(regex, e.currentTarget.innerText.slice(1))
        
        // More selection stuff similar to in checkForHashtags(), did not try extract this out as its differs betwen the two methods
        let sel = window.getSelection()
        sel.extend(this.textbox, 0)
        // Since when we insert a word caret is not at end of word we need to into account how many letters we typed minus the whole word we are inserting (hopeful)
        let pos = sel.toString().length + (e.currentTarget.innerText.length - this.lastWordStr.length);
        this.textbox.innerText = result;

        // Put caret back
        while (pos-- > 0)
          sel.modify('move', 'forward', "character")

        // Now check for hashtags
        this.hideRelatedTagsList();
        this.checkForHashtags();
      })
    });
  }

  hideRelatedTagsList() {
    this.lookupbox.style.visibility = "hidden";
  }

  /**
   * Check if we have a valid hashtag and if so, then embed it in a span tag and set color
   */
  checkForHashtags() {
    let pattern = /(#\w+)/gm; // TODO this does not work well for mid#tag which on twitter disallows entire "word" but in my case colors last part (#tag) blue
    let boxStr = this.textbox.innerText;
    let myTest = pattern.test(boxStr);

    if (myTest) {
      this.typedTags = [...boxStr.match(pattern)];
      //longest word first just in case we have tester , test  (we don't want to try replace in order test, tester)
      this.typedTags.sort((a, b) => b.length - a.length);
    }

    //Replace & recolor all tags
    if (this.typedTags) {
      let str;
      for (const tag of this.typedTags) {
        str = boxStr.replaceAll(tag.toLowerCase(), `<span style="color:#1DA1F2">${tag.toLowerCase()}</span>`)
        boxStr = str; // keep the str
      }

      // Get caret position; we cannot use put caret at end since you can type in the middle of a string, 
      let sel = window.getSelection()
      
      //TODO I need to prevent the range count 0 error here by adding  sel.rangeCount > 0 check
      sel.extend(this.textbox, 0)
      let pos = sel.toString().length

      // Update contenteditable div
      this.textbox.innerHTML = str;

      // Put caret back
      while (pos-- > 0)
        sel.modify('move', 'forward', "character")
    }

  }
}


// Create
const appInstance = new App();